"""
MedTrustX Credentialing Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.credentialing import (
    CredentialCreateRequest, CredentialResponse,
    PrivilegeCreateRequest, PrivilegeResponse,
    PrivilegingRequestCreate, PrivilegingRequestResponse,
    VerifyCredentialRequest, VerificationResponse
)
from src.services import credentialing_service

router = APIRouter(tags=["Credentialing"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Credentials ──

@router.post("/credentials", response_model=CredentialResponse, status_code=status.HTTP_201_CREATED)
async def create_credential(data: CredentialCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    cred = await credentialing_service.create_credential(session, tid, data)
    await session.commit()
    return cred

@router.get("/credentials/{cred_id}", response_model=CredentialResponse)
async def get_credential(cred_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    cred = await credentialing_service.get_credential(session, tid, cred_id)
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    return cred

@router.get("/users/{user_id}/credentials", response_model=List[CredentialResponse])
async def get_user_credentials(user_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await credentialing_service.get_user_credentials(session, tid, user_id)

@router.post("/credentials/{cred_id}/verify", response_model=VerificationResponse)
async def verify_credential(cred_id: uuid.UUID, data: VerifyCredentialRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    try:
        verification = await credentialing_service.verify_credential(session, tid, cred_id, data)
        await session.commit()
        return verification
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Privileges ──

@router.post("/privileges", response_model=PrivilegeResponse, status_code=status.HTTP_201_CREATED)
async def create_privilege(data: PrivilegeCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    priv = await credentialing_service.create_privilege(session, tid, data)
    await session.commit()
    return priv

@router.get("/privileges/{priv_id}", response_model=PrivilegeResponse)
async def get_privilege(priv_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    priv = await credentialing_service.get_privilege(session, tid, priv_id)
    if not priv:
        raise HTTPException(status_code=404, detail="Privilege not found")
    return priv


# ── Privileging Requests ──

@router.post("/privileging-requests", response_model=PrivilegingRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_privileging_request(data: PrivilegingRequestCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    req = await credentialing_service.create_privileging_request(session, tid, data)
    await session.commit()
    return req

@router.get("/privileging-requests/{req_id}", response_model=PrivilegingRequestResponse)
async def get_privileging_request(req_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    req = await credentialing_service.get_privileging_request(session, tid, req_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req
