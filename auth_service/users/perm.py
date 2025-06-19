# users/permissions.py

from typing import List

from rest_framework.permissions import BasePermission
from rest_framework.request import Request

WHITELISTED_IPS: List[str] = ["127.0.0.1"]  # локально або через .env


class IPWhitelistPermission(BasePermission):
    def has_permission(self, request: Request, view: object) -> bool:
        ip: str = request.META.get("REMOTE_ADDR", "")
        return ip in WHITELISTED_IPS
