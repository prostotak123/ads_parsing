# users/views/auth.py
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import permissions, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class CustomLoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
        except AuthenticationFailed as e:
            # Тут виконається custom_exception_handler, якщо підключений
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = response.data["refresh"]
        access = response.data["access"]

        res = Response({"access": access}, status=status.HTTP_200_OK)
        res.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=7 * 24 * 60 * 60,
        )
        return res


class CustomRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Читає refresh-token із cookie, повертає новий access-token.
        """
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"error": "Refresh token not found in cookies"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            user_id = refresh["user_id"]
            user = User.objects.get(id=user_id)
            # Якщо включено ROTATE_REFRESH_TOKENS, оновлюємо refresh
            if hasattr(refresh, "check_blacklist"):  # SimpleJWT з blacklist
                refresh.blacklist()

            new_refresh_token = str(RefreshToken.for_user(user))

            res = Response({"access": access_token}, status=status.HTTP_200_OK)

            # Перестворити cookie
            res.set_cookie(
                key="refresh_token",
                value=new_refresh_token,
                httponly=True,
                secure=True,
                samesite="Strict",
                max_age=7 * 24 * 60 * 60,
            )

            return res

        except TokenError as e:
            return Response({"error": "Invalid refresh token", "detail": str(e)}, status=401)


class VerifyTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Token not provided"}, status=400)
        try:
            validated = AccessToken(token)
            return Response({"valid": True, "user_id": validated["user_id"]})
        except Exception as e:
            return Response({"valid": False, "error": str(e)}, status=401)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token not found in cookies"}, status=400)

        try:
            token = RefreshToken(refresh_token)
            jti = token["jti"]
            token_obj = OutstandingToken.objects.get(jti=jti)

            # 💡 Записуємо в чорний список, якщо ще не записано
            if not BlacklistedToken.objects.filter(token=token_obj).exists():
                BlacklistedToken.objects.create(token=token_obj)

        except OutstandingToken.DoesNotExist:
            # Якщо токен не знайдено — можливо, він уже видалений/некоректний
            pass
        except IntegrityError:
            # Хтось інший уже створив цей запис (гонка) — норм
            pass
        except TokenError as e:
            return Response({"error": str(e)}, status=400)

        res = Response({"detail": "Logout successful"}, status=205)
        res.delete_cookie("refresh_token")
        return res
