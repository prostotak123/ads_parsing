from django.urls import path

from users.views.auth import (
    CustomLoginView,
    CustomRefreshView,
    LogoutView,
    VerifyTokenView,
)
from users.views.profile import (
    ProfileView,
    RegisterView,
)
from users.views.user_admin import (
    UserDetailView,
    UserListView,
    UserUpdateView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", CustomLoginView.as_view(), name="login"),  # 👈 твій новий login
    path("token/refresh/", CustomRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("verify-token/", VerifyTokenView.as_view(), name="verify-token"),
    # адміністрування юзерів
    path("users/<int:id>/", UserDetailView.as_view(), name="user-detail"),
    path("users/<int:id>/edit/", UserUpdateView.as_view(), name="user-edit"),
    path("users/", UserListView.as_view(), name="user-list"),
]
