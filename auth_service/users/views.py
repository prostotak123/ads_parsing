# auth_service/users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import permissions
from django.contrib.auth import get_user_model
from typing import Any
from users.perm import IPWhitelistPermission
from users.serializers import RegisterSerializer, ProfileSerializer

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [
        permissions.AllowAny,
        IPWhitelistPermission,
    ]  # Вхід дозволений усім, але з IP-фільтром

    def post(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        return Response(
            {"username": user.username, "email": user.email},
            status=status.HTTP_201_CREATED,
        )


# class ProfileView(generics.RetrieveAPIView):
#     serializer_class = ProfileSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_object(self):
#         return self.request.user
