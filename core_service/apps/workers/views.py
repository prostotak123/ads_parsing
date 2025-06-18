# workers/views.py

from rest_framework import viewsets, permissions
from .models import WorkerProfile
from .serializers import WorkerProfileSerializer

class WorkerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Видаємо лише ті профілі, що належать авторизованому user_id
        return WorkerProfile.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user.id)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
