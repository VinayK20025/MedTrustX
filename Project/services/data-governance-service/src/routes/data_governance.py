"""
MedTrustX Data Governance Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.data_governance import (
    DataAssetCreate, DataAssetResponse,
    DataClassificationCreate, DataClassificationResponse,
    DataLineageCreate, DataLineageResponse,
    DataQualityRuleCreate, DataQualityRuleResponse,
    DataRetentionPolicyCreate, DataRetentionPolicyResponse
)
from src.services import data_governance_service

router = APIRouter(tags=["Data Governance"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Assets ──

@router.post("/data-assets", response_model=DataAssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(data: DataAssetCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    asset = await data_governance_service.create_asset(session, tid, data)
    await session.commit()
    return asset

@router.get("/data-assets/{asset_id}", response_model=DataAssetResponse)
async def get_asset(asset_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    asset = await data_governance_service.get_asset(session, tid, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


# ── Classifications ──

@router.post("/classifications", response_model=DataClassificationResponse, status_code=status.HTTP_201_CREATED)
async def create_classification(data: DataClassificationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    classification = await data_governance_service.create_classification(session, tid, data)
    await session.commit()
    return classification

@router.get("/classifications/{classification_id}", response_model=DataClassificationResponse)
async def get_classification(classification_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    classification = await data_governance_service.get_classification(session, tid, classification_id)
    if not classification:
        raise HTTPException(status_code=404, detail="Classification not found")
    return classification


# ── Lineage ──

@router.post("/lineage", response_model=DataLineageResponse, status_code=status.HTTP_201_CREATED)
async def record_lineage(data: DataLineageCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    lineage = await data_governance_service.record_lineage(session, tid, data)
    await session.commit()
    return lineage

@router.get("/lineage/{asset_id}", response_model=List[DataLineageResponse])
async def get_lineage(asset_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await data_governance_service.get_lineage(session, tid, asset_id)


# ── Quality Rules ──

@router.post("/quality-rules", response_model=DataQualityRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_quality_rule(data: DataQualityRuleCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rule = await data_governance_service.create_quality_rule(session, tid, data)
    await session.commit()
    return rule

@router.get("/quality-rules/{rule_id}", response_model=DataQualityRuleResponse)
async def get_quality_rule(rule_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rule = await data_governance_service.get_quality_rule(session, tid, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Quality rule not found")
    return rule


# ── Retention Policies ──

@router.post("/retention-policies", response_model=DataRetentionPolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_retention_policy(data: DataRetentionPolicyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    policy = await data_governance_service.create_retention_policy(session, tid, data)
    await session.commit()
    return policy

@router.get("/retention-policies", response_model=List[DataRetentionPolicyResponse])
async def get_retention_policies(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await data_governance_service.get_retention_policies(session, tid)
