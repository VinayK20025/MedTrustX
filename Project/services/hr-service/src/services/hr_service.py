"""
MedTrustX HR Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.hr import (
    Credential,
    Department,
    Employee,
    EmployeeDepartment,
    EmployeeRole,
    Role,
)
from src.schemas.hr import (
    CredentialCreate,
    DepartmentCreate,
    EmployeeCreate,
    EmployeeDepartmentAssign,
    EmployeeRoleAssign,
    EmployeeUpdate,
    RoleCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Departments ─────────────────────────────────────────────────
async def create_department(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: DepartmentCreate,
) -> Department:
    dept = Department(
        tenant_id=tenant_id,
        name=data.name,
    )
    session.add(dept)
    await session.flush()
    return dept


async def get_department(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    dept_id: uuid.UUID,
) -> Optional[Department]:
    result = await session.execute(
        select(Department)
        .where(
            and_(
                Department.id == dept_id,
                Department.tenant_id == tenant_id,
                Department.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Roles ───────────────────────────────────────────────────────
async def create_role(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: RoleCreate,
) -> Role:
    role = Role(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
    )
    session.add(role)
    await session.flush()
    return role


async def get_role(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    role_id: uuid.UUID,
) -> Optional[Role]:
    result = await session.execute(
        select(Role)
        .where(
            and_(
                Role.id == role_id,
                Role.tenant_id == tenant_id,
                Role.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Employees ───────────────────────────────────────────────────
async def create_employee(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: EmployeeCreate,
) -> Employee:
    # Check if email exists
    result = await session.execute(
        select(Employee).where(
            and_(
                Employee.email == data.email,
                Employee.tenant_id == tenant_id,
            )
        )
    )
    if result.scalar_one_or_none():
        raise ValueError("Employee with this email already exists")

    emp = Employee(
        tenant_id=tenant_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        status="active",
    )
    session.add(emp)
    await session.flush()

    await publish_event(
        "EMPLOYEE_CREATED",
        tenant_id=tenant_id,
        employee_id=emp.id,
        payload={"email": emp.email, "status": emp.status},
    )

    return emp


async def get_employee(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
) -> Optional[Employee]:
    result = await session.execute(
        select(Employee)
        .options(
            selectinload(Employee.role_links).selectinload(EmployeeRole.role),
            selectinload(Employee.department_links).selectinload(EmployeeDepartment.department),
            selectinload(Employee.credentials),
        )
        .where(
            and_(
                Employee.id == employee_id,
                Employee.tenant_id == tenant_id,
                Employee.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_employee(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
    data: EmployeeUpdate,
) -> Optional[Employee]:
    emp = await get_employee(session, tenant_id, employee_id)
    if not emp:
        return None

    if emp.status != data.status:
        emp.status = data.status
        emp.updated_at = datetime.now(timezone.utc)
        await session.flush()

        await publish_event(
            "EMPLOYEE_UPDATED",
            tenant_id=tenant_id,
            employee_id=emp.id,
            payload={"status": emp.status},
        )

    return emp


# ── Assignments (Roles & Departments) ───────────────────────────
async def assign_role(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
    data: EmployeeRoleAssign,
) -> EmployeeRole:
    emp = await get_employee(session, tenant_id, employee_id)
    if not emp:
        raise ValueError("Employee not found")

    role = await get_role(session, tenant_id, data.role_id)
    if not role:
        raise ValueError("Role not found")

    link = EmployeeRole(
        tenant_id=tenant_id,
        employee_id=employee_id,
        role_id=data.role_id,
    )
    session.add(link)
    await session.flush()

    await publish_event(
        "ROLE_ASSIGNED",
        tenant_id=tenant_id,
        employee_id=employee_id,
        payload={"role_id": str(role.id)},
    )

    return link


async def assign_department(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
    data: EmployeeDepartmentAssign,
) -> EmployeeDepartment:
    emp = await get_employee(session, tenant_id, employee_id)
    if not emp:
        raise ValueError("Employee not found")

    dept = await get_department(session, tenant_id, data.department_id)
    if not dept:
        raise ValueError("Department not found")

    link = EmployeeDepartment(
        tenant_id=tenant_id,
        employee_id=employee_id,
        department_id=data.department_id,
    )
    session.add(link)
    await session.flush()

    await publish_event(
        "DEPARTMENT_ASSIGNED",
        tenant_id=tenant_id,
        employee_id=employee_id,
        payload={"department_id": str(dept.id)},
    )

    return link


# ── Credentials ─────────────────────────────────────────────────
async def add_credential(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    employee_id: uuid.UUID,
    data: CredentialCreate,
) -> Credential:
    emp = await get_employee(session, tenant_id, employee_id)
    if not emp:
        raise ValueError("Employee not found")

    cred = Credential(
        tenant_id=tenant_id,
        employee_id=employee_id,
        credential_type=data.credential_type,
        issued_by=data.issued_by,
        valid_until=data.valid_until,
    )
    session.add(cred)
    await session.flush()

    await publish_event(
        "CREDENTIAL_ADDED",
        tenant_id=tenant_id,
        employee_id=employee_id,
        payload={"credential_type": cred.credential_type},
    )

    return cred
