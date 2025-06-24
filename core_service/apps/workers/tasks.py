# apps/workers/tasks.py

from celery import shared_task
from django.utils import timezone
from worker.browser import start_browser_session
from worker.interceptors import handle_creatives

from .models import WorkerConfiguration, WorkerExecutionLog


@shared_task
def run_all_eligible_profiles():
    now = timezone.now()
    eligible_profiles = WorkerConfiguration.objects.filter(is_active=True)

    for profile in eligible_profiles:
        next_run = profile.next_run_at()
        if next_run and next_run <= now:
            # Перевіримо чи вже є running для цього профілю
            if not WorkerExecutionLog.objects.filter(configuration=profile, status="running").exists():
                run_worker_profile.delay(profile.id)


@shared_task
def run_worker_profile(profile_id: int):
    """
    Запускає одного воркера для профілю.
    """
    try:
        profile = WorkerConfiguration.objects.get(id=profile_id, is_active=True)
    except WorkerConfiguration.DoesNotExist:
        return

    log = WorkerExecutionLog.objects.create(configuration=profile)

    try:

        async def scrape(page):
            await handle_creatives(page)

        import asyncio

        asyncio.run(start_browser_session(scrape))

        log.status = "success"
        profile.last_run_at = timezone.now()
        profile.save()

    except Exception as e:
        log.status = "failed"
        log.error_message = str(e)

    log.finished_at = timezone.now()
    log.save()

    profile.last_run_at = timezone.now()
    profile.save(update_fields=["last_run_at"])
