from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import WorkerConfiguration, WorkerExecutionLog
from .serializers import WorkerConfigurationSerializer, WorkerExecutionLogSerializer
from .tasks import run_worker_profile


class WorkerConfigurationViewSet(viewsets.ModelViewSet):
    queryset = WorkerConfiguration.objects.all()
    serializer_class = WorkerConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkerConfiguration.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)

    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        profile = self.get_object()
        run_worker_profile.delay(profile.id)
        return Response({"status": f"Profile {profile.id} запуск заплановано"})

class WorkerExecutionLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WorkerExecutionLog.objects.all()
    serializer_class = WorkerExecutionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WorkerExecutionLog.objects.filter(configuration__user_id=self.request.user.id)
