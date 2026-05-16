"""
Role Enforcer / RBAC Engine.
"""
from typing import Dict, Any, List

class RoleEnforcer:
    def __init__(self):
        self.permission_matrix = {
            "Doctor":       ["read:patient", "write:clinical", "read:lab"],
            "Nurse":        ["read:patient", "write:vitals"],
            "IT_Admin":     ["read:all", "write:system", "admin:infra"],
            "Pharmacist":   ["read:prescription", "write:medication"],
            "Board_Member": ["read:reports", "read:analytics"],
            "Radiologist":  ["read:imaging", "write:imaging"],
            "Lab_Tech":     ["read:lab", "write:lab"],
            "Receptionist": ["read:demographics", "write:appointments"],
            "superadmin":   ["*"]
        }

    def get_permissions(self, role_name: str) -> List[str]:
        return self.permission_matrix.get(role_name, [])

    def has_permission(self, role_name: str, permission: str) -> bool:
        perms = self.get_permissions(role_name)
        if "*" in perms:
            return True
        return permission in perms

    def check_multiple_roles(self, roles: List[str], permission: str) -> bool:
        for r in roles:
            if self.has_permission(r, permission):
                return True
        return False
