# from extractors import extract_creatives_from_json
# from db.crud import save_creatives
import asyncio
import json

from .crud import save_creative_if_new

from .airtable import save_creative_to_airtable, send_to_airtable_in_batches, transform_creative_to_airtable

# from .config import ADHEART_URL_CREATIVES
from .utils import safe_get, scroll_slowly_to_bottom, transform_data_from_list_values


async def handle_creatives(page, filter_url: str):
    intercept_trigger = asyncio.Event()

    # Це буде заповнене інтерцептором
    intercepted_data = {
        "total_items": None,
        "creatives": [],
    }
    intercepted_test = {
        "total_items": None,
        "creatives": [],
    }
    seen_ids = set()              # локальний кеш на час запуску
    airtable_batch = [] 
    repeaters=[]
    async def intercept(response):
        if "/api/advertisements/search?" in response.url and response.status == 200:
            try:
                json_data = await response.json()
                count_pages = safe_get(json_data, "pagination", "pages", "total")
                current_page = safe_get(json_data, "pagination", "pages", "current")
                total_items = safe_get(json_data, "pagination", "results", "total")
                current_items = safe_get(json_data, "pagination", "results", "current")
                creatives = safe_get(json_data, "advertisements")

                for creative in creatives:
                    geo=safe_get(creative, 'details',"geo")
                    text_languages = safe_get(creative, 'details', "content","text_languages")
                    ad_id= safe_get(creative,'ad_id')
                    data = {
                        "adheart_id":ad_id,
                        "link_funk": safe_get(creative, "page", "profile_uri"),
                        "media_link": safe_get(creative, "media", 0, "url"),
                        "text": creative.get("text"),
                        "creation_date": safe_get(
                            creative, "creation_date", "formatted_date"
                        ),
                        "publisher_platform": safe_get(creative, "publisher_platform"),
                        "geo": transform_data_from_list_values(geo),
                        "text_languages":transform_data_from_list_values(text_languages),
                        "link": safe_get(creative, "link","link"),
                        "creative_conversion_stats": safe_get(
                            creative,
                            "detailed_targeting",
                        ),
                    }
                    repeaters.append(ad_id)
                    if not ad_id or ad_id in seen_ids:
                        continue 
                    seen_ids.add(ad_id)
                    # 1) трансформ під БД/Аіртейбл (ти так і робив)
                    transformed = transform_creative_to_airtable(data)

                    # 2) БД: створюємо, якщо це новий (idempotent)
                    created = await save_creative_if_new(transformed)

                    if created:
                        airtable_batch.append(transformed)


                if intercepted_data["total_items"] is None:
                    intercepted_data["total_items"] = total_items
                    intercept_trigger.set()
                
                intercepted_test["creatives"].extend(creatives)

                # with open("formatted_results.json", "w", encoding="utf-8") as f:
                #     json.dump(transformed, f, indent=2, ensure_ascii=False)

                # with open("formatted_results_test.json", "w", encoding="utf-8") as f:
                #     json.dump(intercepted_test, f, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"⚠ Failed to parse response from {response.url}: {e}")

    page.on("response", intercept)
    try:
        async with page.expect_response(
            lambda r: "/api/advertisements/search?" in r.url and r.status == 200
        ) as first_response:
            await page.goto(filter_url)

        await first_response.value  # щоб дочекатися і отримати Response
        await page.wait_for_load_state("networkidle")
    except TimeoutError:
        print("⚠ Не вдалося отримати відповідь від API /api/advertisements/search")
        return

    # Чекаємо поки прийде перша відповідь (де буде total_items)
    await intercept_trigger.wait()
    total_items = intercepted_data.get("total_items")
    if total_items:
        await scroll_slowly_to_bottom(page, total_items)
    
    
    if airtable_batch:
        for i in range(0, len(airtable_batch), 10):
            batch = airtable_batch[i:i + 10]
            await send_to_airtable_in_batches(batch)
        airtable_batch.clear()
    # Повільний скролінг
    # await scroll_slowly_to_bottom(page)

    # Збереження
    # await save_creatives(results)