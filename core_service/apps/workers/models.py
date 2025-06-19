from django.db import models
from django.utils import timezone


class WorkerConfiguration(models.Model):
    user_id = models.IntegerField(db_index=True)

    name = models.CharField(max_length=100)  # "adheart main"
    filter_url = models.URLField()

    frequency_minutes = models.PositiveIntegerField(default=60)

    schedule_start_datetime = models.DateTimeField(null=True, blank=True)
    schedule_end_datetime = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    last_run_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ("user_id", "name")

    def __str__(self):
        return f"{self.name} (User {self.user_id})"

    def should_run(self) -> bool:
        """
        Визначає, чи можна запускати воркера в цей момент.
        """
        now = timezone.now()

        if not self.is_active:
            return False

        if self.schedule_start_datetime and now < self.schedule_start_datetime:
            return False

        if self.schedule_end_datetime and now > self.schedule_end_datetime:
            self.is_active = False
            self.save(update_fields=["is_active"])
            return False

        if self.last_run_at:
            elapsed = (now - self.last_run_at).total_seconds() / 60
            if elapsed < self.frequency_minutes:
                return False

        return True


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
