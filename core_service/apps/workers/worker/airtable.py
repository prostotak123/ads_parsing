import asyncio
import os
from pyairtable import Api
from asgiref.sync import sync_to_async


# 🔐 Токен і ID — заміни за потреби або винеси в .env
AIRTABLE_TOKEN = os.getenv("AIRTABLE_TOKEN")
BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_ID = os.getenv("AIRTABLE_TABLE_ID")

from datetime import datetime

PLATFORM_MAP = {
    "instagram": "Instagram",
    "facebook": "Facebook",
    "messenger": "Messenger",
}

def get_airtable_table():
    AIRTABLE_TOKEN = os.getenv("AIRTABLE_TOKEN")
    BASE_ID = os.getenv("AIRTABLE_BASE_ID")
    TABLE_ID = os.getenv("AIRTABLE_TABLE_ID")

    if not all([AIRTABLE_TOKEN, BASE_ID, TABLE_ID]):
        raise RuntimeError("Airtable env variables are not set")

    api = Api(AIRTABLE_TOKEN)
    return api.table(BASE_ID, TABLE_ID)

def transform_creative_to_airtable(creative: dict) -> dict:
    from .utils import safe_get
    active_days=0
    # Дата — лише YYYY-MM-DD
    creation_date = safe_get(creative, "creation_date")
    if creation_date:
            try:
                dt_created = datetime.strptime(creation_date, "%Y-%m-%d %H:%M:%S")
                delta = datetime.now().date() - dt_created.date()
                active_days = delta.days
            except Exception as e:
                print(f"⚠ Не вдалося розпарсити дату: {creation_date} → {e}")
    # GEO
    geo = safe_get(creative, 'geo')

    # Language
    language = safe_get(creative, "text_languages", 0)

    # Platform
    platform = safe_get(creative, "publisher_platform")
    # platform = PLATFORM_MAP.get(platform_raw.lower()) if platform_raw else None
    # Coverage breakdown
    breakdowns  = safe_get(
        creative,
        "creative_conversion_stats",
        "age_country_gender_reach_breakdown",
        0,
        "age_gender_breakdowns"
    ) or []

    coverage = []
    total_reach = safe_get(creative,'creative_conversion_stats','eu_total_reach')
    for entry in breakdowns:
        age = entry.get("age_range", "невідомо")
        male = entry.get("male", 0)
        female = entry.get("female", 0)

        if male:
            male_pct = round(male / total_reach * 100, 2)
            coverage.append(f"Чоловіки({age}) - {male_pct}%")
        if female:
            female_pct = round(female / total_reach * 100, 2)
            coverage.append(f"Жінки({age}) - {female_pct}%")

    return {
        "adheart_id": creative.get('adheart_id'),
        "adheart_link": f"https://adheart.me/uk/ads?detailsId={creative.get('adheart_id')}",
        "media_link": safe_get(creative, "media_link"),
        "text": creative.get("text"),
        "geo": geo,
        "platform": platform,
        "creation_date": creation_date,
        "language": language,
        "funpage_link": safe_get(creative, "link_funk"),
        "coverage": coverage,
        "active_days": active_days,
    }
def save_creative_to_airtable(creative: dict):
    table = get_airtable_table()
    fields = {
        "Adheart Link": creative.get("adheart_link"),
        "Banner/Video": [{"url": creative["media_link"]}] if creative.get("media_link") else [],
        "Ad Text": creative.get("text"),
        "GEO": creative["geo"] if creative.get("geo") else [],
        "Source Placement": creative["platform"] if creative.get("platform") else [],
        "Start Date": creative.get("creation_date"),  # YYYY-MM-DD
        "Language": [creative["language"]] if creative.get("language") else [],
        "FunPage Link": creative.get("funpage_link"),
        "Coverage": creative.get("coverage", []),
        "Active Days": creative.get("active_days"),
    }

    created = table.create(fields,typecast=True)
    return created



async def send_to_airtable_in_batches(records: list[dict]):
    """
    Дуже простий варіант: шле по одному в циклі (але вже через один виклик).
    Хочеш — пізніше замінимо на справжній batch_upsert.
    """
    table = get_airtable_table()

    # по-хорошому тут зробити справжній batch_upsert з key_fields=["Adheart ID"].
    # але щоб нічого не ламати зараз — просто існуючу функцію:
    for r in records:
        try:
            save_creative_to_airtable(r)
        except Exception as e:
            print(f"⚠ Airtable send failed: {e}")
        # трішки тротлінгу, щоб не нарватися на ліміт
        await asyncio.sleep(0.2)
# 👇 Тестовий креатив
# test_creative = {
#     "adheart_link": "https://adheart.me/uk/ads?detailsId=s_1418564469290524",
#     "media_link": "https://ms-6.adheart.me/adheart/teasers/images/2/8/s_1418564469290524_images_0.jpg",
#     "text": "🚨 LETZTE CHANCE – Sommeraktion VERLÄNGERT! ...",
#     "geo": "DE",
#     "platform": "Instagram",
#     "creation_date": "2025-07-22",
#     "language": "DE",
#     "funpage_link": "https://www.facebook.com/61577700066278/",
#     "coverage": [
#         "Чоловіки(18-24) - 25.46%",
#         "Чоловіки(25-34) - 15.91%",
#         "Жінки(18-24) - 11.73%",
#     ],
#     "active_days": 6,
# }

# # 🔁 Виклик
# if __name__ == "__main__":
#     save_creative_to_airtable(test_creative)
