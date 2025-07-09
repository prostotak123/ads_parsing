# users/views/profile.py
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.perm import IPWhitelistPermission
from users.serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny, IPWhitelistPermission]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        return Response(
            {"username": user.username, "email": user.email},
            status=status.HTTP_201_CREATED,
        )

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated, IPWhitelistPermission]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
