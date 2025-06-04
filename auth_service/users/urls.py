from django.urls import path
from .views import ProfileView, RegisterView

urlpatterns = [
    path("me/", ProfileView.as_view()),
    path("register/", RegisterView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
]
