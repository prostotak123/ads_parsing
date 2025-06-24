# workers/serializers.py

from rest_framework import serializers

from .models import WorkerConfiguration, WorkerExecutionLog


class WorkerConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerConfiguration
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "last_run_at"]


class WorkerExecutionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerExecutionLog
        fields = "__all__"
        read_only_fields = ["id", "started_at", "finished_at", "status", "error_message"]
