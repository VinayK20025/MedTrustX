"""
MedTrustX HR Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Roles & Departments ─────────────────────────────────────────
class RoleCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str]


class DepartmentCreate(BaseModel):
    name: str = Field(..., max_length=100)


class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str


# ── Credentials ─────────────────────────────────────────────────
class CredentialCreate(BaseModel):
    credential_type: str = Field(..., max_length=100)
    issued_by: str = Field(..., max_length=100)
    valid_until: Optional[datetime] = None


class CredentialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    employee_id: uuid.UUID
    credential_type: str
    issued_by: str
    valid_until: Optional[datetime]


# ── Employees ───────────────────────────────────────────────────
class EmployeeCreate(BaseModel):
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)


class EmployeeUpdate(BaseModel):
    status: str = Field(..., description="active | suspended | terminated | on_leave")


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str]
    status: str
    hired_at: datetime
    
    # We will return the actual assigned Role and Department objects via relationships
    roles: List[RoleResponse] = []
    departments: List[DepartmentResponse] = []
    credentials: List[CredentialResponse] = []


# ── Linkages ────────────────────────────────────────────────────
class EmployeeRoleAssign(BaseModel):
    role_id: uuid.UUID


class EmployeeDepartmentAssign(BaseModel):
    department_id: uuid.UUID
