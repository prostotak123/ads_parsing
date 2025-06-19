# workers/serializers.py

from rest_framework import serializers

from .models import WorkerConfiguration


class WorkerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerConfiguration
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
