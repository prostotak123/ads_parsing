# import asyncio
# import random



# def transform_data_from_list_values(data,default=None):
#     """
#     Безпечний доступ до глибоко вкладених структур (dict + list).
#     Приклад:
#         safe_get(creative, "details", "content", "link", "url")
#         safe_get(creative, "media", 0, "url")
#     """
#     transformed_list=[]
#     for value in data:
#         tr_data=value.get("name") or value.get("link") or value.get("value")
#         transformed_list.append(tr_data)
#     return transformed_list


# def safe_get(data, *keys, default=None):
#     """
#     Безпечний доступ до глибоко вкладених структур (dict + list).
#     Приклад:
#         safe_get(creative, "details", "content", "link", "url")
#         safe_get(creative, "media", 0, "url")
#     """
#     for key in keys:
#         if isinstance(data, dict):
#             data = data.get(key, default)
#         elif isinstance(data, list):
#             if isinstance(key, int) and 0 <= key < len(data):
#                 data = data[key]
#             else:
#                 return default
#         else:
#             return default
#         if data is None:
#             return default
#     return data



# async def get_last_visible_index(page):
#     items = page.locator("#cards [data-index]")
#     count = await items.count()
#     if count == 0:
#         return -1

#     indexes = []
#     for i in range(count):
#         val = await items.nth(i).get_attribute("data-index")
#         if val and val.isdigit():
#             indexes.append(int(val))
#         else:
#             indexes.append(val)
#     print(indexes)
#     last_item = items.nth(count - 1)
#     last_index = await last_item.get_attribute("data-index")
#     return int(last_index) if last_index and last_index.isdigit() else -1


# async def scroll_slowly_to_bottom(page, total_expected_items: int):
#     last_items_count = 0
#     stable_count = 0
#     max_stable_repeats = 5

#     while True:
#         # Прокрутити вниз на випадкову висоту
#         scroll_step = random.randint(500, 1500)
#         await page.evaluate(f"window.scrollBy(0, {scroll_step})")

#         # Затримка з варіативністю
#         delay = random.uniform(0.8, 2.0)
#         await page.wait_for_timeout(delay * 1000)

#         # Чекати відповідь інтерцептора
#         await asyncio.sleep(0.3)

#         # Перевіримо скільки айтемів уже відрендерено
#         # items_count = page.locator("#cards [data-index]")
#         # last_item = await items_count.count()
#         items_count = await get_last_visible_index(page)
#         if items_count == last_items_count:
#             stable_count += 1
#         else:
#             stable_count = 0

#         last_items_count = items_count

#         # Якщо зібрали все або довго нічого не змінюється
#         # if items_count >= total_expected_items or stable_count >= max_stable_repeats:
#         if items_count >= total_expected_items :
#             print(f"✅ Total items loaded: {items_count}")
#             break


# apps/workers/worker/utils.py
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from typing import Any, Optional, Iterable

from playwright.async_api import Page


def set_query_param(url: str, key: str, value: Any) -> str:
    """
    Додає/замінює query-параметр у URL і повертає оновлену урлу.
    """
    u = urlparse(url)
    q = parse_qs(u.query, keep_blank_values=True)
    q[str(key)] = [str(value)]
    return urlunparse((u.scheme, u.netloc, u.path, u.params, urlencode(q, doseq=True), u.fragment))


def safe_get(data: Any, *keys: Any, default: Optional[Any] = None) -> Any:
    """
    Безпечний доступ до глибоко вкладених структур (dict/list).
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


def transform_data_from_list_values(items: Optional[Iterable[dict]]) -> list:
    """
    Витягує значення з колекції словників: name/link/value → масив рядків.
    """
    if not items:
        return []
    out = []
    for value in items:
        if not isinstance(value, dict):
            continue
        v = value.get("name") or value.get("link") or value.get("value")
        if v is not None:
            out.append(v)
    return out


async def get_last_visible_index(page: Page) -> int:
    """
    Знаходить останній видимий data-index у гріді (#cards [data-index]).
    Повертає -1, якщо елементів немає або атрибут нечисловий.
    """
    items = page.locator("#cards [data-index]")
    count = await items.count()
    if count == 0:
        return -1
    last = items.nth(count - 1)
    idx = await last.get_attribute("data-index")
    return int(idx) if idx and idx.isdigit() else -1
