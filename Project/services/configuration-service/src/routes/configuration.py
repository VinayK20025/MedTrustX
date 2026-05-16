"""
MedTrustX Configuration Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.configuration import (
    ConfigurationCreate, ConfigurationResponse,
    FeatureFlagCreate, FeatureFlagResponse,
    EnvironmentCreate, EnvironmentResponse,
    ConfigVersionResponse
)
from src.services import configuration_service

router = APIRouter(tags=["Configuration Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Configurations ──

@router.post("/config", response_model=ConfigurationResponse, status_code=status.HTTP_200_OK)
async def set_configuration(data: ConfigurationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    config = await configuration_service.set_configuration(session, tid, data)
    await session.commit()
    return config

@router.get("/config/{service_name}", response_model=List[ConfigurationResponse])
async def get_configuration(service_name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await configuration_service.get_configuration(session, tid, service_name)


# ── Feature Flags ──

@router.post("/feature-flags", response_model=FeatureFlagResponse, status_code=status.HTTP_200_OK)
async def set_feature_flag(data: FeatureFlagCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    flag = await configuration_service.set_feature_flag(session, tid, data)
    await session.commit()
    return flag

@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
async def get_feature_flags(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await configuration_service.get_feature_flags(session, tid)


# ── Environments ──

@router.post("/environments", response_model=EnvironmentResponse, status_code=status.HTTP_201_CREATED)
async def create_environment(data: EnvironmentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    env = await configuration_service.create_environment(session, tid, data)
    await session.commit()
    return env

@router.get("/environments", response_model=List[EnvironmentResponse])
async def get_environments(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await configuration_service.get_environments(session, tid)


# ── Versions ──

@router.get("/config/versions", response_model=List[ConfigVersionResponse])
async def get_config_versions(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await configuration_service.get_config_versions(session, tid)
