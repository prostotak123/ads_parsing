# apps/workers/worker/human.py
import asyncio, random

async def human_idle(page, *, min_pause=0.3, max_pause=1.3):
    # дрібний скрол + пауза
    if random.random() < 0.8:
        step = random.randint(200, 900)
        await page.evaluate(f"window.scrollBy(0, {step})")
    await asyncio.sleep(random.uniform(min_pause, max_pause))

async def human_scroll_burst(page):
    # серія дрібних скролів, ніби «озираємось»
    for _ in range(random.randint(3, 6)):
        await human_idle(page, min_pause=0.2, max_pause=0.7)
