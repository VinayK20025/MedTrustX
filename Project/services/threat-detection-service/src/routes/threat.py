"""
MedTrustX Threat Detection Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.threat import (
    AlertResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    ModelResponse,
    ModelTrainRequest,
    RiskScoreResponse,
    ThreatEventResponse,
)
from src.services import threat_service

router = APIRouter(tags=["Threat Detection"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Core Analysis ──

@router.post(
    "/threat/analyze",
    response_model=AnalyzeResponse,
    summary="Analyse an event for threats",
)
async def analyze_event(
    data: AnalyzeRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    result = await threat_service.analyze(session, tenant_id, data)
    await session.commit()
    return result


# ── Threat Events ──

@router.get(
    "/threat/events",
    response_model=List[ThreatEventResponse],
    summary="List threat events",
)
async def list_events(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await threat_service.get_threat_events(session, tenant_id)


# ── Risk Scores ──

@router.get(
    "/risk-score/{entity_id}",
    response_model=RiskScoreResponse,
    summary="Get entity risk score",
)
async def get_risk_score(
    entity_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    score = await threat_service.get_risk_score(session, tenant_id, entity_id)
    if not score:
        raise HTTPException(status_code=404, detail="Risk score not found")
    return score


# ── Models ──

@router.post(
    "/models/train",
    response_model=ModelResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger model training",
)
async def train_model(
    data: ModelTrainRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    model = await threat_service.trigger_training(session, tenant_id, data)
    await session.commit()
    return model


# ── Alerts ──

@router.get(
    "/alerts",
    response_model=List[AlertResponse],
    summary="List threat alerts",
)
async def list_alerts(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await threat_service.get_alerts(session, tenant_id)
