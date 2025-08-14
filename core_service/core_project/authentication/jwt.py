import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            # 🔴 Якщо токену нема — це точно 401
            raise AuthenticationFailed("Authorization header missing or invalid")

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError as err:
            raise AuthenticationFailed("Token has expired") from err
        except jwt.DecodeError as err:
            raise AuthenticationFailed("Token is invalid") from err
        except Exception as err:
            raise AuthenticationFailed("Authentication failed") from err

        return (AuthenticatedUser(payload), token)


class AuthenticatedUser:
    def __init__(self, payload):
        self.id = payload.get("user_id")
        self.email = payload.get("email")
        self.is_authenticated = True

    def __str__(self):
        return f"User({self.id})"
