# from extractors import extract_creatives_from_json
# from db.crud import save_creatives
import asyncio
import json
from config import ADHEART_URL_CREATIVES
from utils import safe_get, scroll_slowly_to_bottom


async def handle_creatives(page):
    # results = []

    # Це буде заповнене інтерцептором
    intercepted_data = {
        "total_items": None,
        "creatives": [],
        "first_response_received": asyncio.Event(),  # Асинхронний тригер
    }

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
                    data = {
                        "link_funk": safe_get(creative, "page", "profile_uri"),
                        "media_link": creative.get("media", "url"),
                        "text": creative.get("text"),
                        "creation_date": safe_get(
                            creative, "creation_date", "formatted_date"
                        ),
                        "publisher_platform": safe_get(creative, "publisher_platform"),
                        "geo": safe_get(creative, "geo"),
                        "text_languages": safe_get(creative, "text_languages"),
                        "link": safe_get(creative, "link"),
                        "creative_conversion_stats": safe_get(
                            creative,
                            "detailed_targeting",
                            "age_country_gender_reach_breakdown",
                        ),
                    }
                if intercepted_data["total_items"] is None:
                    intercepted_data["total_items"] = total_items
                    intercepted_data["first_response_received"].set()

                intercepted_data["creatives"].extend(creatives)

                with open("formatted_results.json", "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"⚠ Failed to parse response from {response.url}: {e}")

    page.on("response", intercept)
    await page.goto(ADHEART_URL_CREATIVES)  # З фільтрами
    await page.wait_for_timeout(10000)
    await page.wait_for_load_state("networkidle")
    # Чекаємо поки прийде перша відповідь (де буде total_items)
    await intercepted_data["first_response_received"].wait()
    total_items = intercepted_data.get("total_items")
    if total_items:
        total_items = total_items - 1
        await scroll_slowly_to_bottom(page, total_items)

    # Повільний скролінг
    # await scroll_slowly_to_bottom(page)

    # Збереження
    # await save_creatives(results)
