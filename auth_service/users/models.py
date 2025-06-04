from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from typing import Optional


class CustomUserManager(BaseUserManager):
    def create_user(self, email: str, password: Optional[str] = None, **extra_fields) -> 'User':
        if not email:
            raise ValueError("Користувач повинен мати email")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # хешує пароль
        user.save()
        return user

    def create_superuser(self, email: str, password: str, **extra_fields) -> 'User':
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'  # для входу
    REQUIRED_FIELDS = ['username']

    def __str__(self) -> str:
        return self.email
