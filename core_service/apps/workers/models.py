
from django.contrib.postgres.fields import ArrayField  # 👈 обов’язково для PostgreSQL
from django.db import models
from django.utils import timezone


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
        unique_together = ("user_id", "name")

    def __str__(self):
        return f"Profile {self.name} (User {self.user_id})"

    def next_run_at(self):
        now = timezone.now()

        match self.schedule_type:
            case self.MANUAL:
                return None  # Мануальний профіль запускається тільки руками
            case self.SCHEDULED_ONCE:
                return self.schedule_time
            case self.DAILY:
                if self.schedule_time:
                    today_run = self.schedule_time.replace(year=now.year, month=now.month, day=now.day)
                    if today_run < now:
                        today_run = today_run + timezone.timedelta(days=1)
                    return today_run
            case self.INTERVAL:
                if self.last_run_at:
                    return self.last_run_at + timezone.timedelta(minutes=self.frequency_minutes)
                else:
                    return now  # Якщо ніколи не запускався — можна запускати одразу

        return None

    def should_run(self):
        if not self.is_active:
            return False

        if self.schedule_type != self.MANUAL:
            return False

        now = timezone.now()

        if self.schedule_start and now < self.schedule_start:
            return False
        if self.schedule_end and now > self.schedule_end:
            return False

        if self.last_run_at is None:
            return True

        elapsed = (now - self.last_run_at).total_seconds() / 60
        return elapsed >= self.frequency_minutes


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
