"""MedTrustX HR Service — Models."""
from src.models.base import BaseModel
from src.models.hr import Employee, Department, Role, EmployeeRole, EmployeeDepartment, Credential

__all__ = ["BaseModel", "Employee", "Department", "Role", "EmployeeRole", "EmployeeDepartment", "Credential"]
