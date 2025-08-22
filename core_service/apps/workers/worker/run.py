# apps/workers/worker/run.py
from .browser import start_browser, _ensure_auth  # _ensure_auth тепер публічний

async def run_scrape(filter_url, scrape_coro):
    async with start_browser() as (browser, context):
        # контекст вже авторизований
        page = await context.new_page()
        await page.wait_for_timeout(300 + int(200))
        await scrape_coro(page, filter_url)
        await page.close()
