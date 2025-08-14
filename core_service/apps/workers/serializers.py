# workers/serializers.py

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import AdCreative, WorkerConfiguration, WorkerExecutionLog


class WorkerConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerConfiguration
        fields = "__all__"
        read_only_fields = ["id", "user_id", "created_at", "updated_at", "last_run_at"]

    def validate(self, data):
        for key in ["schedule_time", "daily_run_time", "schedule_start", "schedule_end"]:
            if key in data and data[key] == "":
                data[key] = None
        schedule_type = data.get("schedule_type")

        match schedule_type:
            case WorkerConfiguration.SCHEDULED_ONCE:
                if not data.get("schedule_time"):
                    raise ValidationError({"schedule_time": "Це поле є обовʼязковим для типу Scheduled Once."})

            case WorkerConfiguration.INTERVAL:
                if not data.get("schedule_start"):
                    raise ValidationError({"schedule_start": "Це поле є обовʼязковим для інтервального типу."})
                if not data.get("schedule_end"):
                    raise ValidationError({"schedule_end": "Це поле є обовʼязковим для інтервального типу."})
                if not data.get("frequency_minutes"):
                    raise ValidationError({"frequency_minutes": "Це поле є обовʼязковим для інтервального типу."})

            case WorkerConfiguration.DAILY:
                if not data.get("daily_run_time"):
                    raise ValidationError({"daily_run_time": "Це поле є обовʼязковим для щоденного типу."})
                if not data.get("schedule_start"):
                    raise ValidationError({"schedule_start": "Це поле є обовʼязковим для щоденного типу."})
                if not data.get("schedule_end"):
                    raise ValidationError({"schedule_end": "Це поле є обовʼязковим для щоденного типу."})

        return data

    def create(self, validated_data):
        user_id = validated_data.get("user_id")
        name = validated_data.get("name")

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
        fields = '__all__'