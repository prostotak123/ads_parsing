from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    ProfileView,
    RegisterView,
    UserDetailView,
    UserListView,
    UserUpdateView,
    VerifyTokenView,
)

urlpatterns = [
    # path("me/", ProfileView.as_view()),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("verify-token/", VerifyTokenView.as_view(), name="verify-token"),
    path("users/<int:id>/", UserDetailView.as_view(), name="user-detail"),
    path("users/<int:id>/edit/", UserUpdateView.as_view(), name="user-edit"),
    path("users/", UserListView.as_view(), name="user-list"),
]
