# apps/workers/worker/interceptors.py
import asyncio
import math

from playwright.async_api import Page

from .crud import save_creative_if_new
from .airtable import send_to_airtable_in_batches, transform_creative_to_airtable
from .utils import safe_get, transform_data_from_list_values, set_query_param, get_last_visible_index
from .human import human_idle, human_scroll_burst

# Константи поведінки
PAGE_SIZE = 40                 # очікувана кількість оголошень на сторінці
STALL_LIMIT = 5                # скільки разів поспіль data-index не зростає → стрибок на ?page=
FIRST_RESPONSE_TIMEOUT_MS = 30000
API_TIMEOUT_MS = 20000


async def handle_creatives(page: Page, filter_url: str) -> None:
    """
    Гібридний збір:
      - скролимо UI, поки зростає data-index
      - якщо «застрягли» STALL_LIMIT разів — переходимо на наступну ?page= в UI
      - інтерцептор збирає JSON з /api/advertisements/search?
      - уникаємо дублів по ad_id, зберігаємо тільки нові
    """
    intercept_ready = asyncio.Event()

    total_pages: int = 1
    total_items = None
    api_current_page = None

    seen_ids = set()
    airtable_batch = []

    # ---------- інтерцептор відповідей API -----------------------------------
    async def intercept(response):
        nonlocal total_pages, total_items, api_current_page
        url = response.url
        if "/api/advertisements/search?" in url and response.status == 200:
            try:
                data = await response.json()

                total_pages = safe_get(data, "pagination", "pages", "total") or total_pages
                api_current_page = safe_get(data, "pagination", "pages", "current") or api_current_page
                if total_items is None:
                    total_items = safe_get(data, "pagination", "results", "total")

                creatives = safe_get(data, "advertisements") or []
                for cr in creatives:
                    ad_id = safe_get(cr, "ad_id")
                    # if not ad_id or ad_id in seen_ids:
                    #     continue
                    seen_ids.add(ad_id)

                    geo = safe_get(cr, "details", "geo") or []
                    langs = safe_get(cr, "details", "content", "text_languages") or []

                    payload = {
                        "adheart_id": ad_id,
                        "funpage_link": safe_get(cr, "page", "profile_uri"),          # узгоджено з БД
                        "media_link": safe_get(cr, "media", 0, "url"),
                        "text": cr.get("text"),
                        "creation_date": safe_get(cr, "creation_date", "formatted_date"),
                        "publisher_platform": safe_get(cr, "publisher_platform"),
                        "geo": transform_data_from_list_values(geo),
                        "text_languages": transform_data_from_list_values(langs),
                        "link": safe_get(cr, "link", "link"),
                        "creative_conversion_stats": safe_get(cr, "detailed_targeting"),
                    }

                    transformed = transform_creative_to_airtable(payload)
                    created = await save_creative_if_new(transformed)
                    if created:
                        airtable_batch.append(transformed)

                if not intercept_ready.is_set():
                    intercept_ready.set()

            except Exception as e:
                print(f"⚠ parse failed: {e}")

    page.on("response", intercept)

    # ---------- 1) відкриваємо фільтр і чекаємо першу відповідь API ----------
    try:
        async with page.expect_response(
            lambda r: "/api/advertisements/search?" in r.url and r.status == 200,
            timeout=FIRST_RESPONSE_TIMEOUT_MS,
        ) as rctx:
            await page.goto(filter_url, wait_until="domcontentloaded")
        await rctx.value
    except Exception:
        # даємо шанс бекенду/клієнту
        await human_idle(0.5, 1.0)

    await page.wait_for_load_state("networkidle")

    try:
        await asyncio.wait_for(intercept_ready.wait(), timeout=FIRST_RESPONSE_TIMEOUT_MS / 1000)
    except asyncio.TimeoutError:
        raise RuntimeError("First API response not intercepted; check filter_url or auth state")

    # ---------- 2) основний цикл: скролимо + стрибаємо по ?page= при застої ---
    last_ui_index = -1
    stall_count = 0
    current_page = api_current_page or 1

    while True:
        # Стоп, якщо все зібрали
        if total_items is not None and len(seen_ids) >= total_items:
            break

        # Якщо сторінки закінчились і немає total_items — виходимо
        if total_items is None and current_page > total_pages and stall_count >= STALL_LIMIT:
            break

        # Невелика «серія» людяної активності + перевірка прогресу data-index
        grew = False
        await human_scroll_burst(page)     # кілька дрібних скролів
        await asyncio.sleep(0.3)           # дати інтерцептору підхопити JSON

        ui_idx = await get_last_visible_index(page)
        if ui_idx > last_ui_index:
            last_ui_index = ui_idx
            grew = True

        if grew:
            stall_count = 0
        else:
            stall_count += 1

        # Якщо застрягли — стрибаємо на наступну сторінку
        if stall_count >= STALL_LIMIT:
            expected_next_page = math.floor(len(seen_ids) / PAGE_SIZE) + 1
            next_page = max(current_page + 1, expected_next_page)
            if total_pages:
                next_page = min(next_page, total_pages)
            if next_page <= current_page:
                break

            jump_url = set_query_param(filter_url, "page", next_page)
            try:
                async with page.expect_response(
                    lambda r, np=next_page: (
                        "/api/advertisements/search?" in r.url
                        and f"page={np}" in r.url
                        and r.status == 200
                    ),
                    timeout=API_TIMEOUT_MS,
                ) as rctx:
                    await page.goto(jump_url, wait_until="domcontentloaded")
                await rctx.value
                await page.wait_for_load_state("networkidle")
            except Exception as e:
                print(f"⚠ page jump to {next_page} failed: {e}")
                # друга спроба без жорсткої перевірки URL
                await page.goto(set_query_param(filter_url, "page", next_page), wait_until="domcontentloaded")
                await page.wait_for_load_state("networkidle")

            current_page = next_page
            stall_count = 0
            await human_idle(0.6, 1.2)

        # Додаткова умова завершення, якщо total_items відомий
        if total_items is not None and len(seen_ids) >= total_items:
            break

    # ---------- 3) відправка в Airtable батчами -------------------------------
    if airtable_batch:
        for i in range(0, len(airtable_batch), 10):
            batch = airtable_batch[i : i + 10]
            await send_to_airtable_in_batches(batch)
        airtable_batch.clear()
