from django.db import models
from django.utils import timezone


class WorkerConfiguration(models.Model):
    MANUAL = 'manual'
    SCHEDULED = 'scheduled'

    SCHEDULE_CHOICES = [
        (MANUAL, 'Manual'),
        (SCHEDULED, 'Scheduled'),
    ]

    user_id = models.IntegerField(db_index=True)  # прив'язка до JWT-користувача
    name = models.CharField(max_length=100)
    filter_url = models.URLField()

    schedule_type = models.CharField(
        max_length=20,
        choices=SCHEDULE_CHOICES,
        default=MANUAL,
    )
    schedule_start = models.DateTimeField(null=True, blank=True)
    schedule_end = models.DateTimeField(null=True, blank=True)
    frequency_minutes = models.PositiveIntegerField(default=60)

    is_active = models.BooleanField(default=True)
    last_run_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ("user_id", "name")

    def __str__(self):
        return f"Profile {self.name} (User {self.user_id})"

    def should_run(self):
        if not self.is_active:
            return False

        if self.schedule_type != self.SCHEDULED:
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
    configuration = models.ForeignKey(
        WorkerConfiguration, on_delete=models.CASCADE, related_name="execution_logs"
    )

    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("success", "Success"), ("failed", "Failed")],
        default="pending"
    )

    error_message = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"Run {self.pk} for profile {self.configuration.name} — {self.status}"
