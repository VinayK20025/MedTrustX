"""
MedTrustX TF Serving Service — API Routes
TF-Serving compatible REST surface: /v1/models/*
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.serving import (
    ClassifyRequest,
    ClassifyResponse,
    InferenceLogResponse,
    ModelInfoResponse,
    PredictRequest,
    PredictResponse,
    RegressRequest,
    RegressResponse,
)
from src.services import serving_service

router = APIRouter(prefix="/v1", tags=["TF Serving"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Predict ──

@router.post("/models/{model_name}:predict", response_model=PredictResponse, summary="Run prediction")
async def predict(model_name: str, data: PredictRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    entity_id = request.headers.get("X-Entity-ID")
    try:
        result = await serving_service.run_inference(session, tid, model_name, "predict", data.instances, entity_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    await session.commit()
    return result


# ── Classify ──

@router.post("/models/{model_name}:classify", response_model=ClassifyResponse, summary="Run classification")
async def classify(model_name: str, data: ClassifyRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    entity_id = request.headers.get("X-Entity-ID")
    try:
        result = await serving_service.run_inference(session, tid, model_name, "classify", data.instances, entity_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    await session.commit()
    return result


# ── Regress ──

@router.post("/models/{model_name}:regress", response_model=RegressResponse, summary="Run regression")
async def regress(model_name: str, data: RegressRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    entity_id = request.headers.get("X-Entity-ID")
    try:
        result = await serving_service.run_inference(session, tid, model_name, "regress", data.instances, entity_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    await session.commit()
    return result


# ── Model Info ──

@router.get("/models", response_model=List[ModelInfoResponse], summary="List served models")
async def list_models(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await serving_service.list_models(session, tid)


@router.get("/models/{model_name}", response_model=ModelInfoResponse, summary="Get model info")
async def get_model(model_name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    model = await serving_service.get_model_info(session, tid, model_name)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    return model


# ── Inference Logs ──

@router.get("/inference-logs", response_model=List[InferenceLogResponse], summary="List inference logs")
async def list_logs(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await serving_service.get_inference_logs(session, tid)
