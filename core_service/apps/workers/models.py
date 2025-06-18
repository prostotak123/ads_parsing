# workers/models.py

from django.db import models

class WorkerProfile(models.Model):
    user_id = models.IntegerField(db_index=True)  # Прив’язка по user_id з JWT
    name = models.CharField(max_length=100)  # Назва профілю, наприклад "adheart main"
    filter_url = models.URLField()  # Посилання з фільтрами adheart.me
    frequency_minutes = models.PositiveIntegerField(default=60)  # Частота запуску
    is_active = models.BooleanField(default=True)  # Чи активний профіль

    # Додаткові параметри — необов’язкові, але корисні
    # timezone = models.CharField(max_length=50, default="UTC")
    # notifications_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = ("user_id", "name")

    def __str__(self):
        return f"Profile {self.name} (User {self.user_id})"
