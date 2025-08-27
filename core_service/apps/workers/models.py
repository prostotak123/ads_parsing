from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.contrib.postgres.fields import ArrayField  # 👈 обов’язково для PostgreSQL
from django.db import models
from django.utils import timezone as dj_tz


class WorkerConfiguration(models.Model):
    MANUAL = "manual"
    SCHEDULED_ONCE = "scheduled_once"
    INTERVAL = "interval"
    DAILY = "daily"

    SCHEDULE_CHOICES = [
        (MANUAL, "Manual"),
        (SCHEDULED_ONCE, "Scheduled Once"),
        (INTERVAL, "Interval"),
        (DAILY, "Daily at specific time"),
    ]

    STATUS_PENDING = "pending"
    STATUS_RUNNING = "running"
    STATUS_SUCCESS = "success"
    STATUS_FAILED = "failed"
    STATUS_NEVER = "never"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_RUNNING, "Running"),
        (STATUS_SUCCESS, "Success"),
        (STATUS_FAILED, "Failed"),
        (STATUS_NEVER, "Never"),
    ]

    user_id = models.IntegerField(db_index=True)  # прив'язка до JWT-користувача
    name = models.CharField(max_length=100)
    filter_url = models.URLField()

    schedule_type = models.CharField(
        max_length=20,
        choices=SCHEDULE_CHOICES,
        default=MANUAL,
    )
    current_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEVER,
    )
    schedule_time = models.DateTimeField(null=True, blank=True)

    schedule_start = models.DateTimeField(null=True, blank=True)
    schedule_end = models.DateTimeField(null=True, blank=True)
    # next_run = models.DateTimeField(null=True, blank=True)  # Для всіх, крім MANUAL
    frequency_minutes = models.PositiveIntegerField(null=True, blank=True)  # Для інтервалів
    daily_run_time = models.TimeField(null=True, blank=True)  # Для щоденного запуску

    is_active = models.BooleanField(default=True)
    last_run_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "worker_configuration"
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(fields=["user_id", "name"], name="unique_user_name"),
            models.UniqueConstraint(
                fields=["user_id", "filter_url", "schedule_type"], name="unique_user_filter_schedule"
            ),
        ]

    def __str__(self):
        return f"Profile {self.name} (User {self.user_id})"

    def next_run_at(self, *, ref=None):
        now_utc = ref or dj_tz.now()  # aware UTC

        match self.schedule_type:
            case self.MANUAL:
                return None

            case self.SCHEDULED_ONCE:
                print(self.name)
                # Якщо вже був запуск і час запуску новий, то запускаємо
                if self.last_run_at and self.schedule_time and self.last_run_at < self.schedule_time:
                    return self.schedule_time  # Якщо останній запуск був до нового часу

                # Якщо профіль не був ще запущений, то запускаємо на schedule_time
                if not self.last_run_at and self.schedule_time:
                    return self.schedule_time

                # Якщо вже був запуск, не запускаємо більше
                return None

            case self.DAILY:
                # Згідно валідації, всі ці поля обов'язкові для DAILY
                if not (self.daily_run_time and self.schedule_start and self.schedule_end):
                    return None

                # Якщо поточний час поза межами дозволеного періоду
                if now_utc < self.schedule_start:
                    return None

                if now_utc > self.schedule_end:
                    return None

                # Якщо немає останнього запуску - перший запуск в schedule_start
                if not self.last_run_at:
                    return self.schedule_start if self.schedule_start >= now_utc else now_utc

                # Перевіряємо чи був запуск сьогодні
                last_run_date = self.last_run_at.date()
                now_date = now_utc.date()

                # Якщо останній запуск був сьогодні - переносимо на завтра
                if last_run_date == now_date:
                    # Наступний запуск завтра о daily_run_time
                    next_run = datetime.combine(
                        now_date + timedelta(days=1), self.daily_run_time, tzinfo=ZoneInfo("UTC")
                    )
                else:
                    # Можемо запускати сьогодні о daily_run_time або зараз
                    today_run_time = datetime.combine(now_date, self.daily_run_time, tzinfo=ZoneInfo("UTC"))
                    next_run = today_run_time if today_run_time >= now_utc else now_utc

                # Якщо наступний запуск виходить за межі schedule_end
                if next_run > self.schedule_end:
                    return None

                # Якщо наступний час ще не настав, повертаємо його
                if next_run > now_utc:
                    return next_run

                # Якщо час вже пройшов, можемо запускати зараз
                return now_utc

            case self.INTERVAL:
                # Згідно валідації, всі ці поля обов'язкові для INTERVAL
                if not (self.schedule_start and self.schedule_end and self.frequency_minutes):
                    return None

                # Якщо поточний час поза межами дозволеного інтервалу
                if now_utc < self.schedule_start:
                    return None

                if now_utc > self.schedule_end:
                    return None

                # Якщо немає останнього запуску - перший запуск в schedule_start
                if not self.last_run_at:
                    return self.schedule_start if self.schedule_start >= now_utc else now_utc

                # Обчислюємо наступний час запуску від останнього запуску
                next_run = self.last_run_at + timedelta(minutes=self.frequency_minutes)

                # Якщо наступний запуск виходить за межі schedule_end
                if next_run > self.schedule_end:
                    return None

                # Якщо наступний час ще не настав, повертаємо його
                if next_run > now_utc:
                    return next_run

                # Якщо час вже пройшов, можемо запускати зараз
                return now_utc


class WorkerExecutionLog(models.Model):
    configuration = models.ForeignKey(WorkerConfiguration, on_delete=models.CASCADE, related_name="execution_logs")

    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("running", "Running"), ("success", "Success"), ("failed", "Failed")],
        default="pending",
    )

    error_message = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "worker_execution_log"
        ordering = ["-started_at"]

    def __str__(self):
        return f"Run {self.pk} for profile {self.configuration.name} — {self.status}"


class AdCreative(models.Model):
    adheart_id = models.CharField(max_length=64, unique=True)
    adheart_link = models.URLField()
    media_link = models.URLField(blank=True, null=True)
    text = models.TextField(blank=True, null=True)

    geo = ArrayField(models.CharField(max_length=128), blank=True, default=list)  # "Німеччина"
    platform = ArrayField(models.CharField(max_length=32), blank=True, default=list)
    creation_date = models.DateTimeField(blank=True, null=True)

    language = models.CharField(max_length=64, blank=True, null=True)
    funpage_link = models.URLField(blank=True, null=True)

    coverage = ArrayField(models.CharField(max_length=128), blank=True, default=list)
    active_days = models.PositiveIntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
