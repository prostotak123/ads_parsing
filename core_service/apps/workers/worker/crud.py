from apps.workers.models import AdCreative
from django.db import IntegrityError
from asgiref.sync import sync_to_async


@sync_to_async
def save_creative_if_new(data) -> bool:
    created = False
    try:
        """
        True => щойно створили (новий запис у БД)
        False => уже існував (нічого не робимо)
        """
        if not data.get("adheart_id"):
            return False

        _, created = AdCreative.objects.get_or_create(
            adheart_id=data["adheart_id"],
            defaults={
                "adheart_link": data["adheart_link"],
                "media_link": data.get("media_link"),
                "text": data.get("text"),
                "geo": data.get("geo", []),
                "platform": data.get("platform", []),
                "creation_date": data.get("creation_date"),
                "language": data.get("language"),
                "funpage_link": data.get("funpage_link"),
                "coverage": data.get("coverage", []),
                "active_days": data.get("active_days"),
            },
    )
    except IntegrityError:
        # Уже існує — можна просто пропустити або оновити, якщо треба
        pass
    except Exception as err:
        print(err)
        # Уже існує — можна просто пропустити або оновити, якщо треба
        pass
    return created
