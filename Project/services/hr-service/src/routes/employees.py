"""
MedTrustX HR Service — Employees Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.hr import (
    CredentialCreate,
    CredentialResponse,
    EmployeeCreate,
    EmployeeDepartmentAssign,
    EmployeeResponse,
    EmployeeRoleAssign,
    EmployeeUpdate,
)
from src.services import hr_service

router = APIRouter(prefix="/employees", tags=["Employees"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new employee",
)
async def create_employee(
    data: EmployeeCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        emp = await hr_service.create_employee(session, tenant_id, data)
        await session.commit()
        return await hr_service.get_employee(session, tenant_id, emp.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Get complete employee profile",
)
async def get_employee(
    employee_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    emp = await hr_service.get_employee(session, tenant_id, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    # Transform relationships into schema format
    resp = EmployeeResponse.model_validate(emp)
    resp.roles = [link.role for link in emp.role_links]
    resp.departments = [link.department for link in emp.department_links]
    return resp

@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
    summary="Update employee employment status",
)
async def update_employee(
    employee_id: uuid.UUID,
    data: EmployeeUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    emp = await hr_service.update_employee(session, tenant_id, employee_id, data)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    await session.commit()
    
    # Reload for full schema response
    return await get_employee(employee_id, request, session)

@router.post(
    "/{employee_id}/roles",
    status_code=status.HTTP_201_CREATED,
    summary="Assign a role to an employee",
)
async def assign_role(
    employee_id: uuid.UUID,
    data: EmployeeRoleAssign,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        await hr_service.assign_role(session, tenant_id, employee_id, data)
        await session.commit()
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/{employee_id}/departments",
    status_code=status.HTTP_201_CREATED,
    summary="Assign an employee to a department",
)
async def assign_department(
    employee_id: uuid.UUID,
    data: EmployeeDepartmentAssign,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        await hr_service.assign_department(session, tenant_id, employee_id, data)
        await session.commit()
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/{employee_id}/credentials",
    response_model=CredentialResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a credential or license to an employee",
)
async def add_credential(
    employee_id: uuid.UUID,
    data: CredentialCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        cred = await hr_service.add_credential(session, tenant_id, employee_id, data)
        await session.commit()
        return cred
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
