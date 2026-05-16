"""
MedTrustX HR Service — Domain Entities

Tables:
  employees             – Master employee records
  departments           – Hospital departments (e.g., Cardiology, ICU)
  roles                 – Job roles (e.g., Senior Surgeon, Registered Nurse)
  employee_roles        – Many-to-many link between staff and roles
  employee_departments  – Many-to-many link between staff and departments
  credentials           – Licenses, qualifications, and certifications
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Department(BaseModel):
    """
    Hospital Departments.
    """

    __tablename__ = "departments"
    __table_args__ = (
        Index("ix_departments_name", "tenant_id", "name"),
        {"comment": "Hospital organizational departments"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # ── Relationships ───────────────────────────────────────────
    employee_links: Mapped[List["EmployeeDepartment"]] = relationship(
        "EmployeeDepartment", back_populates="department", cascade="all, delete-orphan"
    )


class Role(BaseModel):
    """
    Job roles and titles within the hospital.
    """

    __tablename__ = "roles"
    __table_args__ = (
        Index("ix_roles_name", "tenant_id", "name"),
        {"comment": "Organizational job roles"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    employee_links: Mapped[List["EmployeeRole"]] = relationship(
        "EmployeeRole", back_populates="role", cascade="all, delete-orphan"
    )


class Employee(BaseModel):
    """
    Master record for an employee.
    """

    __tablename__ = "employees"
    __table_args__ = (
        Index("ix_employees_email", "tenant_id", "email"),
        Index("ix_employees_status", "tenant_id", "status"),
        {"comment": "Master employee records"},
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | suspended | terminated | on_leave",
    )

    hired_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    # ── Relationships ───────────────────────────────────────────
    role_links: Mapped[List["EmployeeRole"]] = relationship(
        "EmployeeRole", back_populates="employee", cascade="all, delete-orphan"
    )
    department_links: Mapped[List["EmployeeDepartment"]] = relationship(
        "EmployeeDepartment", back_populates="employee", cascade="all, delete-orphan"
    )
    credentials: Mapped[List["Credential"]] = relationship(
        "Credential", back_populates="employee", cascade="all, delete-orphan"
    )


class EmployeeRole(BaseModel):
    """
    Mapping of employees to their job roles.
    """

    __tablename__ = "employee_roles"
    __table_args__ = (
        Index("ix_emp_roles_emp", "tenant_id", "employee_id"),
        Index("ix_emp_roles_role", "tenant_id", "role_id"),
        {"comment": "Employee role assignments"},
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
    )

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    # ── Relationships ───────────────────────────────────────────
    employee: Mapped["Employee"] = relationship("Employee", back_populates="role_links")
    role: Mapped["Role"] = relationship("Role", back_populates="employee_links")


class EmployeeDepartment(BaseModel):
    """
    Mapping of employees to departments.
    """

    __tablename__ = "employee_departments"
    __table_args__ = (
        Index("ix_emp_deps_emp", "tenant_id", "employee_id"),
        Index("ix_emp_deps_dep", "tenant_id", "department_id"),
        {"comment": "Employee department assignments"},
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    # ── Relationships ───────────────────────────────────────────
    employee: Mapped["Employee"] = relationship("Employee", back_populates="department_links")
    department: Mapped["Department"] = relationship("Department", back_populates="employee_links")


class Credential(BaseModel):
    """
    Employee licenses and certifications.
    """

    __tablename__ = "credentials"
    __table_args__ = (
        Index("ix_credentials_emp", "tenant_id", "employee_id"),
        {"comment": "Employee qualifications and licenses"},
    )

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
    )

    credential_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="e.g., Medical License, ACLS Certification",
    )

    issued_by: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    valid_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    employee: Mapped["Employee"] = relationship("Employee", back_populates="credentials")
