# # Create your tests here.
# from django.contrib.auth import get_user_model
# from django.urls import reverse
# from rest_framework import status
# from rest_framework.test import APITestCase

# User = get_user_model()


# class UserRegistrationTest(APITestCase):
#     def test_register_user(self):
#         url = reverse("register")
#         data = {
#             "username": "testuser",
#             "email": "test@example.com",
#             "password": "Testpass123",
#         }
#         response = self.client.post(url, data, format="json")
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(User.objects.count(), 1)
#         self.assertEqual(User.objects.get().email, "test@example.com")
# users/tests/test_auth.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user():
    def make_user(**kwargs):
        return User.objects.create_user(
            email=kwargs.get("email", "test@example.com"),
            password=kwargs.get("password", "TestPass123"),
            username=kwargs.get("username", "tester"),
        )
    return make_user


def test_login_sets_cookie(api_client, create_user):
    """
    Перевіряємо, що login:
    - повертає access-token
    - встановлює refresh-token в cookie
    """
    user = create_user()
    response = api_client.post("/api/auth/login/", {
        "email": user.email,
        "password": "TestPass123"
    })

    assert response.status_code == 200
    assert "access" in response.json()
    assert "refresh_token" in response.cookies  # 👈 перевіряємо cookie


def test_refresh_returns_new_access(api_client, create_user):
    """
    Симулюємо логін → робимо refresh → очікуємо новий access
    """
    user = create_user()
    login = api_client.post("/api/auth/login/", {
        "email": user.email,
        "password": "TestPass123"
    })

    assert "refresh_token" in login.cookies
    api_client.cookies["refresh_token"] = login.cookies["refresh_token"].value

    refresh = api_client.post("/api/auth/token/refresh/")
    assert refresh.status_code == 200
    assert "access" in refresh.json()


def test_logout_blacklists_token(api_client, create_user):
    """
    Перевіряємо, що logout:
    - очищає cookie
    - працює з валідним refresh
    """
    user = create_user()
    login = api_client.post("/api/auth/login/", {
        "email": user.email,
        "password": "TestPass123"
    })

    refresh_token = login.cookies["refresh_token"].value
    api_client.cookies["refresh_token"] = refresh_token

    logout = api_client.post("/api/auth/logout/")
    assert logout.status_code == 205
    cookie = logout.cookies.get("refresh_token")
    assert cookie is not None
    assert cookie.value == ""
    assert cookie["expires"] == "Thu, 01 Jan 1970 00:00:00 GMT"
