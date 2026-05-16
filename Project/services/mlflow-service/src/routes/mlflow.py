"""
MedTrustX MLflow Service — API Routes
MLflow-compatible REST surface: /api/2.0/mlflow/*
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.mlflow import (
    ExperimentCreateRequest,
    ExperimentResponse,
    LogMetricRequest,
    LogParameterRequest,
    MetricResponse,
    ModelVersionCreateRequest,
    ModelVersionResponse,
    ModelVersionTransitionRequest,
    ParameterResponse,
    RunCreateRequest,
    RunResponse,
)
from src.services import mlflow_service

router = APIRouter(prefix="/api/2.0/mlflow", tags=["MLflow"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Experiments ──

@router.post("/experiments/create", response_model=ExperimentResponse, status_code=status.HTTP_201_CREATED, summary="Create experiment")
async def create_experiment(data: ExperimentCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    exp = await mlflow_service.create_experiment(session, tid, data)
    await session.commit()
    return exp


@router.get("/experiments/list", response_model=List[ExperimentResponse], summary="List experiments")
async def list_experiments(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await mlflow_service.list_experiments(session, tid)


@router.get("/experiments/get/{exp_id}", response_model=ExperimentResponse, summary="Get experiment")
async def get_experiment(exp_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    exp = await mlflow_service.get_experiment(session, tid, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp


# ── Runs ──

@router.post("/runs/create", response_model=RunResponse, status_code=status.HTTP_201_CREATED, summary="Create run")
async def create_run(data: RunCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    run = await mlflow_service.create_run(session, tid, data)
    await session.commit()
    return run


@router.get("/runs/get/{run_id}", response_model=RunResponse, summary="Get run")
async def get_run(run_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    run = await mlflow_service.get_run(session, tid, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.post("/runs/finish/{run_id}", response_model=RunResponse, summary="Finish run")
async def finish_run(run_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    run = await mlflow_service.finish_run(session, tid, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    await session.commit()
    return run


# ── Metrics ──

@router.post("/runs/log-metric", response_model=MetricResponse, status_code=status.HTTP_201_CREATED, summary="Log metric")
async def log_metric(data: LogMetricRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    metric = await mlflow_service.log_metric(session, tid, data)
    await session.commit()
    return metric


@router.get("/runs/{run_id}/metrics", response_model=List[MetricResponse], summary="Get run metrics")
async def get_run_metrics(run_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await mlflow_service.get_run_metrics(session, run_id)


# ── Parameters ──

@router.post("/runs/log-parameter", response_model=ParameterResponse, status_code=status.HTTP_201_CREATED, summary="Log parameter")
async def log_parameter(data: LogParameterRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    param = await mlflow_service.log_parameter(session, tid, data)
    await session.commit()
    return param


@router.get("/runs/{run_id}/params", response_model=List[ParameterResponse], summary="Get run parameters")
async def get_run_params(run_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await mlflow_service.get_run_parameters(session, run_id)


# ── Model Versions ──

@router.post("/model-versions/create", response_model=ModelVersionResponse, status_code=status.HTTP_201_CREATED, summary="Register model version")
async def register_model(data: ModelVersionCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    model = await mlflow_service.register_model_version(session, tid, data)
    await session.commit()
    return model


@router.post("/model-versions/transition-stage/{model_id}", response_model=ModelVersionResponse, summary="Transition model stage")
async def transition_stage(model_id: uuid.UUID, data: ModelVersionTransitionRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    model = await mlflow_service.transition_model_stage(session, tid, model_id, data)
    if not model:
        raise HTTPException(status_code=404, detail="Model version not found")
    await session.commit()
    return model


@router.get("/model-versions/list", response_model=List[ModelVersionResponse], summary="List model versions")
async def list_models(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await mlflow_service.list_model_versions(session, tid)


@router.get("/model-versions/get/{model_id}", response_model=ModelVersionResponse, summary="Get model version")
async def get_model(model_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    model = await mlflow_service.get_model_version(session, tid, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model version not found")
    return model
