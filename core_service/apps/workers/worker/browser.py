# apps/workers/worker/browser.py
import asyncio
import os
from playwright.async_api import async_playwright, TimeoutError as PWTimeout

from .config import ADHEART_URL_LOGIN, ADHEART_URL_DASHBOARD, EMAIL, PASSWORD, STATE_PATH

AUTH_PROOF_SELECTOR = "div.swiper-slide.sc-7780ff0-1.kRGDPU.swiper-slide-active"


async def login(page):
    """Вхід + збереження STATE_PATH."""
    await page.goto(ADHEART_URL_LOGIN, wait_until="domcontentloaded")
    await page.fill('input[type="email"]', EMAIL)
    await page.fill('input[type="password"]', PASSWORD)
    await page.click('[data-cy="button-submit"]')
    # чекаємо появу елемента, який буває тільки після авторизації
    await page.wait_for_selector(AUTH_PROOF_SELECTOR, timeout=20000)
    await page.context.storage_state(path=STATE_PATH)


async def is_logged_in(page) -> bool:
    """Перевіряє, чи ще жива сесія (куки з STATE_PATH)."""
    try:
        await page.goto(ADHEART_URL_DASHBOARD, wait_until="networkidle")
        await page.wait_for_selector(AUTH_PROOF_SELECTOR, timeout=5000)
        return True
    except PWTimeout:
        return False


async def start_browser_session(callback):
    async with async_playwright() as p:
        browser = await p.chromium.launch(slow_mo=100, headless=True)
        context = await browser.new_context(
            storage_state=STATE_PATH if os.path.exists(STATE_PATH) else None
        )
        page = await context.new_page()

        # якщо стейту нема або він протух → робимо логін
        if not os.path.exists(STATE_PATH) or not await is_logged_in(page):
            await login(page)

        # тепер гарантовано авторизовані
        await callback(page)

        await asyncio.sleep(2)
        await browser.close()
