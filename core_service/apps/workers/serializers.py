# workers/serializers.py

from datetime import datetime
from zoneinfo import ZoneInfo

from django.utils import timezone as dj_tz
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import AdCreative, WorkerConfiguration, WorkerExecutionLog

KYIV_TZ = ZoneInfo("Europe/Kyiv")
UTC_TZ = ZoneInfo("UTC")


class WorkerConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerConfiguration
        fields = "__all__"
        read_only_fields = ["id", "user_id", "created_at", "updated_at", "last_run_at"]

    # Нормалізація пустих рядків → None
    def _empty_to_none(self, data: dict) -> dict:
        for key in ["schedule_time", "daily_run_time", "schedule_start", "schedule_end"]:
            if key in data and data[key] == "":
                data[key] = None
        return data

    def _to_aware_utc(self, dt: datetime | None) -> datetime | None:
        """Приймає datetime (aware або naive) і повертає aware-UTC.
        Якщо naive — трактуємо як київський локальний."""
        if dt is None:
            return None
        if dj_tz.is_naive(dt):
            # трактуємо як “Київський стінковий”
            dt = dt.replace(tzinfo=KYIV_TZ)
        return dt.astimezone(UTC_TZ)

    def validate(self, attrs):
        attrs = self._empty_to_none(attrs)
        # якщо часткове оновлення — підтягуємо поточні значення
        instance = getattr(self, "instance", None)
        # schedule_type = attrs.get("schedule_type", getattr(instance, "schedule_type", WorkerConfiguration.MANUAL))
        user_id = attrs.get("user_id", getattr(instance, "user_id", None))
        filter_url = attrs.get("filter_url", getattr(instance, "filter_url", None))
        schedule_type = attrs.get("schedule_type", getattr(instance, "schedule_type", None))
        qs = WorkerConfiguration.objects.filter(user_id=user_id, filter_url=filter_url, schedule_type=schedule_type)
        if instance:
            qs = qs.exclude(pk=instance.pk)

        if qs.exists():
            raise ValidationError(
                {"filter_url": "Профіль з таким фільтром і типом розкладу вже існує для цього користувача."}
            )

        # --- Валідація під кожен тип ---
        match schedule_type:
            case WorkerConfiguration.SCHEDULED_ONCE:
                st = attrs.get("schedule_time", getattr(instance, "schedule_time", None))
                if not st:
                    raise ValidationError({"schedule_time": "Це поле є обовʼязковим для типу Scheduled Once."})
                # Нормалізуємо до UTC незалежно від того, що прислав фронт
                attrs["schedule_time"] = self._to_aware_utc(st)

            case WorkerConfiguration.INTERVAL:
                ss = attrs.get("schedule_start", getattr(instance, "schedule_start", None))
                se = attrs.get("schedule_end", getattr(instance, "schedule_end", None))
                fm = attrs.get("frequency_minutes", getattr(instance, "frequency_minutes", None))
                if not ss:
                    raise ValidationError({"schedule_start": "Це поле є обовʼязковим для інтервального типу."})
                if not se:
                    raise ValidationError({"schedule_end": "Це поле є обовʼязковим для інтервального типу."})
                if not fm:
                    raise ValidationError({"frequency_minutes": "Це поле є обовʼязковим для інтервального типу."})
                # до UTC
                attrs["schedule_start"] = self._to_aware_utc(ss)
                attrs["schedule_end"] = self._to_aware_utc(se)
                if attrs["schedule_start"] >= attrs["schedule_end"]:
                    raise ValidationError({"schedule_end": "schedule_end має бути пізніше за schedule_start."})

            case WorkerConfiguration.DAILY:
                drt = attrs.get("daily_run_time", getattr(instance, "daily_run_time", None))
                ss = attrs.get("schedule_start", getattr(instance, "schedule_start", None))
                se = attrs.get("schedule_end", getattr(instance, "schedule_end", None))
                if not drt:
                    raise ValidationError({"daily_run_time": "Це поле є обовʼязковим для щоденного типу."})
                if not ss:
                    raise ValidationError({"schedule_start": "Це поле є обовʼязковим для щоденного типу."})
                if not se:
                    raise ValidationError({"schedule_end": "Це поле є обовʼязковим для щоденного типу."})
                # інтервал дії (опційно нормалізуємо до UTC — збереження в UTC нікому не шкодить)
                attrs["schedule_start"] = self._to_aware_utc(ss)
                attrs["schedule_end"] = self._to_aware_utc(se)
                if attrs["schedule_start"] >= attrs["schedule_end"]:
                    raise ValidationError({"schedule_end": "schedule_end має бути пізніше за schedule_start."})

            case WorkerConfiguration.MANUAL:
                # без додаткових вимог
                pass

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        # name має бути унікальним на користувача
        user_id = validated_data.get("user_id") or request.user.id
        name = validated_data.get("name")
        filter_url = validated_data.get("filter_url")
        schedule_type = validated_data.get("schedule_type")
        # Перевірка унікальності
        if WorkerConfiguration.objects.filter(
            user_id=user_id, filter_url=filter_url, schedule_type=schedule_type
        ).exists():
            raise ValidationError(
                {"filter_url": "Профіль з таким фільтром і типом розкладу вже існує для цього користувача."}
            )

        if WorkerConfiguration.objects.filter(user_id=user_id, name=name).exists():
            raise ValidationError({"name": "Профіль з таким іменем уже існує для цього користувача."})
        return super().create(validated_data)


class WorkerExecutionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerExecutionLog
        fields = "__all__"
        read_only_fields = ["id", "started_at", "finished_at", "status", "error_message"]


class AdCreativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdCreative
        fields = "__all__"
