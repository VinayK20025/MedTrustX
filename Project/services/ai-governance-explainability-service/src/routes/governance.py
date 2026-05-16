"""
MedTrustX AI Governance & Explainability Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.governance import DecisionCreate, DecisionResponse, ExplainabilityResponse, ModelCreate, ModelResponse, PolicyResponse
from src.services import governance_service

router = APIRouter(tags=["AI Governance & Explainability Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/models", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(data: ModelCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    model = await governance_service.create_model(session, tid, data)
    await session.commit()
    return model

@router.get("/models/{id}", response_model=ModelResponse)
async def get_model(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    model = await governance_service.get_model(session, tid, id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model

@router.post("/decisions", response_model=DecisionResponse, status_code=status.HTTP_201_CREATED)
async def record_decision(data: DecisionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    decision = await governance_service.record_decision(session, tid, data)
    await session.commit()
    return decision

@router.get("/decisions/{id}", response_model=DecisionResponse)
async def get_decision(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    decision = await governance_service.get_decision(session, tid, id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision

@router.get("/explainability/{model_id}", response_model=List[ExplainabilityResponse])
async def list_explainability(model_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await governance_service.list_explainability(session, tid, model_id)

@router.get("/policies", response_model=List[PolicyResponse])
async def list_policies(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await governance_service.list_policies(session, tid)
