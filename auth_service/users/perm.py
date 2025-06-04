# users/permissions.py

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from typing import List

WHITELISTED_IPS: List[str] = ["127.0.0.1", "62.122.206.196"]  # локально або через .env

class IPWhitelistPermission(BasePermission):
    def has_permission(self, request: Request, view: object) -> bool:
        ip: str = request.META.get("REMOTE_ADDR", "")
        return ip in WHITELISTED_IPS
