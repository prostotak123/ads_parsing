import pytz
from celery import shared_task
from django.db import transaction
from django.utils import timezone

from .models import WorkerConfiguration, WorkerExecutionLog
from .worker.browser import start_browser_session
from .worker.interceptors import handle_creatives

utc = pytz.utc
kiev_tz = pytz.timezone("Europe/Kiev")


@shared_task
def run_all_eligible_profiles():
    now = timezone.now()  # ✅ AWARE-UTC
    # мінімізуй кількість об'єктів у пам'ять (тільки потрібні поля)
    qs = WorkerConfiguration.objects.filter(is_active=True).only(
        "id", "filter_url", "schedule_type", "daily_run_time", "last_run_at",
        "schedule_time", "schedule_start", "schedule_end"
    )

    for profile in qs:
        next_run = profile.next_run_at(ref=now)  # ✅ повертає AWARE-UTC
        if not next_run or next_run > now:
            continue

        # ✅ антигонка: піднімаємо "running" лог атомарно
        with transaction.atomic():
            already_running = WorkerExecutionLog.objects.select_for_update(skip_locked=True).filter(
                configuration=profile, status="running"
            ).exists()
            if already_running:
                continue

            # Створюємо лог "running" тут, щоб навіть два beat-транча не стартанули двічі
            WorkerExecutionLog.objects.create(configuration=profile, status="running")
            profile.current_status = WorkerConfiguration.STATUS_RUNNING
            profile.last_run_at = now
            profile.save(update_fields=["current_status", "last_run_at"])

        # Поза транзакцією — відправляємо Celery-задачу
        run_worker_profile.delay(profile.id, profile.filter_url)


@shared_task
def run_worker_profile(profile_id: int, filter_url: str):
    """
    Запускає одного воркера для профілю.
    """
    try:
        profile = WorkerConfiguration.objects.get(id=profile_id, is_active=True)
    except WorkerConfiguration.DoesNotExist:
        return

    log = WorkerExecutionLog.objects.create(configuration=profile)

    # одразу ставимо статус "running"
    profile.current_status = "running"
    profile.save(update_fields=["current_status"])

    try:

        async def scrape(page):
            await handle_creatives(page, filter_url=filter_url)

        import asyncio

        asyncio.run(start_browser_session(scrape))

        log.status = "success"
        profile.current_status = "success"

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)
        profile.current_status = "failed"

    finally:
        log.finished_at = timezone.now()
        log.save()

        profile.last_run_at = timezone.now()
        profile.save(update_fields=["last_run_at", "current_status"])
