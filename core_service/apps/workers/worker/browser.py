import asyncio
import os

from .config import ADHEART_URL_LOGIN, EMAIL, PASSWORD, STATE_PATH
from playwright.async_api import async_playwright


async def login(page):
    await page.goto(ADHEART_URL_LOGIN)
    await page.fill('input[type="email"]', EMAIL)
    await page.fill('input[type="password"]', PASSWORD)
    await page.click('[data-cy="button-submit"]')
    await page.wait_for_timeout(1500)
    cookies = await page.context.cookies()


async def start_browser_session(callback):
    async with async_playwright() as p:
        # browser = await p.chromium.launch(slow_mo=100, headless=True, proxy=proxy)
        browser = await p.chromium.launch(slow_mo=100, headless=True)
        context = await browser.new_context(
            storage_state=STATE_PATH if os.path.exists(STATE_PATH) else None
        )
        page = await context.new_page()

        if not os.path.exists(STATE_PATH):
            await login(page)
            await asyncio.sleep(30)
        await page.wait_for_timeout(10000)
        await context.storage_state(path=STATE_PATH)
        await callback(page)
        await asyncio.sleep(5)

        await browser.close()
