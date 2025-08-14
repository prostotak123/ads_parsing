import datetime

import pytz
from celery import shared_task
from django.utils import timezone

from .models import WorkerConfiguration, WorkerExecutionLog
from .worker.browser import start_browser_session
from .worker.interceptors import handle_creatives

utc = pytz.utc
kiev_tz = pytz.timezone("Europe/Kiev")


@shared_task
def run_all_eligible_profiles():
    now = datetime.datetime.now(tz=kiev_tz)
    now1 = datetime.datetime.now(tz=kiev_tz)
    print(now1)
    eligible_profiles = WorkerConfiguration.objects.filter(is_active=True)

    for profile in eligible_profiles:
        next_run = profile.next_run_at()
        if next_run and next_run <= now:
            # Перевіримо чи вже є running для цього профілю
            if not WorkerExecutionLog.objects.filter(configuration=profile, status="running").exists():
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
