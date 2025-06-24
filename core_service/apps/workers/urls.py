from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import WorkerConfigurationViewSet, WorkerExecutionLogViewSet

router = DefaultRouter()
router.register(r'profiles', WorkerConfigurationViewSet, basename='workerprofile')
router.register(r'logs', WorkerExecutionLogViewSet, basename='workerlog')

urlpatterns = [
    path('', include(router.urls)),
]
