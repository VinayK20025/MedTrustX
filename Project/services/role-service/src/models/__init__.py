"""MedTrustX Role Management Service — Models."""
from src.models.base import BaseModel
from src.models.role import Role, Permission, RolePermission, RoleHierarchy, UserRoleAssignment

__all__ = ["BaseModel", "Role", "Permission", "RolePermission", "RoleHierarchy", "UserRoleAssignment"]
