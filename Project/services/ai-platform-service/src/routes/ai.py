"""
MedTrustX AI Platform Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.ai import (
    FeedbackRequest,
    FeedbackResponse,
    ModelResponse,
    PredictRequest,
    PredictResponse,
    PredictionHistoryResponse,
    TrainRequest,
    TrainingJobResponse,
)
from src.services import ai_service

router = APIRouter(prefix="/ai", tags=["AI Platform"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Predict ──

@router.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run ML prediction",
)
async def predict(
    data: PredictRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    result = await ai_service.predict(session, tid, data)
    await session.commit()
    return result


# ── Models ──

@router.get(
    "/models",
    response_model=List[ModelResponse],
    summary="List registered models",
)
async def list_models(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    return await ai_service.list_models(session, tid)


@router.get(
    "/models/{model_id}",
    response_model=ModelResponse,
    summary="Get model details",
)
async def get_model(
    model_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    model = await ai_service.get_model(session, tid, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


# ── Training ──

@router.post(
    "/train",
    response_model=TrainingJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger model training",
)
async def trigger_training(
    data: TrainRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    job = await ai_service.trigger_training(session, tid, data)
    await session.commit()
    return job


# ── Prediction History ──

@router.get(
    "/predictions/{entity_id}",
    response_model=List[PredictionHistoryResponse],
    summary="Get prediction history for entity",
)
async def get_predictions(
    entity_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    return await ai_service.get_predictions(session, tid, entity_id)


# ── Feedback ──

@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit prediction feedback",
)
async def submit_feedback(
    data: FeedbackRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    fb = await ai_service.record_feedback(session, tid, data)
    await session.commit()
    return fb
