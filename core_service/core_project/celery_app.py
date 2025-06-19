# core_project/celery.py
import os

from celery import Celery

# Вказуємо Django-середовище
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core_project.settings")

app = Celery("core_project")

# Завантаження конфігурації з Django settings.py (CELERY_*)
app.config_from_object("django.conf:settings", namespace="CELERY")

# Автоматичне знаходження тасків у всіх додатках
app.autodiscover_tasks()
