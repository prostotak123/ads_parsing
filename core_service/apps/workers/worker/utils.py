import asyncio
import random

MAX_STABLE_REPEATS=5
MIN_SCROLL_STEP=500
MAX_SCROLL_STEP=1500

def transform_data_from_list_values(data,default=None):
    """
    Безпечний доступ до глибоко вкладених структур (dict + list).
    Приклад:
        safe_get(creative, "details", "content", "link", "url")
        safe_get(creative, "media", 0, "url")
    """
    transformed_list=[]
    for value in data:
        tr_data=value.get("name") or value.get("link") or value.get("value")
        transformed_list.append(tr_data)
    return transformed_list


def safe_get(data, *keys, default=None):
    """
    Безпечний доступ до глибоко вкладених структур (dict + list).
    Приклад:
        safe_get(creative, "details", "content", "link", "url")
        safe_get(creative, "media", 0, "url")
    """
    for key in keys:
        if isinstance(data, dict):
            data = data.get(key, default)
        elif isinstance(data, list):
            if isinstance(key, int) and 0 <= key < len(data):
                data = data[key]
            else:
                return default
        else:
            return default
        if data is None:
            return default
    return data



async def get_last_visible_index(page):
    items = page.locator("#cards [data-index]")
    count = await items.count()
    if count == 0:
        return -1

    last_item = items.nth(count - 1)
    last_index = await last_item.get_attribute("data-index")
    return int(last_index) if last_index and last_index.isdigit() else -1


async def scroll_slowly_to_bottom(page, total_expected_items: int):
    last_items_count = 0
    stable_count = 0

    while True:
        # Прокрутити вниз на випадкову висоту
        scroll_step = random.randint(MIN_SCROLL_STEP, MAX_SCROLL_STEP)
        await page.evaluate(f"window.scrollBy(0, {scroll_step})")

        # Затримка з варіативністю
        delay = random.uniform(0.8, 2.0)
        await page.wait_for_timeout(delay * 1000)

        # Чекати відповідь інтерцептора
        await asyncio.sleep(0.3)

        # Перевіримо скільки айтемів уже відрендерено
        # items_count = page.locator("#cards [data-index]")
        # last_item = await items_count.count()
        items_count = await get_last_visible_index(page)
        if items_count == last_items_count:
            stable_count += 1
        else:
            stable_count = 0

        last_items_count = items_count

        # Якщо зібрали все або довго нічого не змінюється
        if items_count >= total_expected_items or stable_count >= MAX_STABLE_REPEATS:
            print(f"✅ Total items loaded: {items_count}")
            break