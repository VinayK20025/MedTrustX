"""
MedTrustX MLflow Service — Business Logic Layer

MLflow-compatible lifecycle management: experiment CRUD, run management,
metric/parameter logging, and model version registry with stage promotion.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.mlflow import (
    Experiment,
    RegisteredModel,
    Run,
    RunMetric,
    RunParameter,
)
from src.schemas.mlflow import (
    ExperimentCreateRequest,
    LogMetricRequest,
    LogParameterRequest,
    ModelVersionCreateRequest,
    ModelVersionTransitionRequest,
    RunCreateRequest,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Experiments ──

async def create_experiment(
    session: AsyncSession, tenant_id: uuid.UUID, data: ExperimentCreateRequest
) -> Experiment:
    exp = Experiment(
        tenant_id=tenant_id,
        name=data.name,
        tags=data.tags,
    )
    session.add(exp)
    await session.flush()
    return exp


async def get_experiment(
    session: AsyncSession, tenant_id: uuid.UUID, exp_id: uuid.UUID
) -> Optional[Experiment]:
    result = await session.execute(
        select(Experiment).where(
            and_(Experiment.id == exp_id, Experiment.tenant_id == tenant_id, Experiment.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_experiments(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Experiment]:
    result = await session.execute(
        select(Experiment).where(and_(Experiment.tenant_id == tenant_id, Experiment.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Runs ──

async def create_run(
    session: AsyncSession, tenant_id: uuid.UUID, data: RunCreateRequest
) -> Run:
    run = Run(
        tenant_id=tenant_id,
        experiment_id=data.experiment_id,
        status="RUNNING",
        source_name=data.source_name,
        tags=data.tags,
    )
    session.add(run)
    await session.flush()
    return run


async def get_run(
    session: AsyncSession, tenant_id: uuid.UUID, run_id: uuid.UUID
) -> Optional[Run]:
    result = await session.execute(
        select(Run).where(
            and_(Run.id == run_id, Run.tenant_id == tenant_id, Run.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def finish_run(
    session: AsyncSession, tenant_id: uuid.UUID, run_id: uuid.UUID, status: str = "FINISHED"
) -> Optional[Run]:
    run = await get_run(session, tenant_id, run_id)
    if not run:
        return None
    run.status = status
    run.ended_at = datetime.now(timezone.utc)
    await session.flush()

    await publish_event("MODEL_TRAINED", tenant_id, run_id, {"status": status, "experiment_id": str(run.experiment_id)})
    return run


# ── Metrics ──

async def log_metric(
    session: AsyncSession, tenant_id: uuid.UUID, data: LogMetricRequest
) -> RunMetric:
    metric = RunMetric(
        tenant_id=tenant_id,
        run_id=data.run_id,
        key=data.key,
        value=data.value,
        step=data.step,
    )
    session.add(metric)
    await session.flush()
    return metric


async def get_run_metrics(
    session: AsyncSession, run_id: uuid.UUID
) -> List[RunMetric]:
    result = await session.execute(
        select(RunMetric).where(RunMetric.run_id == run_id).order_by(RunMetric.step)
    )
    return list(result.scalars().all())


# ── Parameters ──

async def log_parameter(
    session: AsyncSession, tenant_id: uuid.UUID, data: LogParameterRequest
) -> RunParameter:
    param = RunParameter(
        tenant_id=tenant_id,
        run_id=data.run_id,
        key=data.key,
        value=data.value,
    )
    session.add(param)
    await session.flush()
    return param


async def get_run_parameters(
    session: AsyncSession, run_id: uuid.UUID
) -> List[RunParameter]:
    result = await session.execute(
        select(RunParameter).where(RunParameter.run_id == run_id)
    )
    return list(result.scalars().all())


# ── Model Versions ──

async def register_model_version(
    session: AsyncSession, tenant_id: uuid.UUID, data: ModelVersionCreateRequest
) -> RegisteredModel:
    model = RegisteredModel(
        tenant_id=tenant_id,
        name=data.name,
        version=data.version,
        stage="None",
        run_id=data.run_id,
        source=data.source,
        description=data.description,
    )
    session.add(model)
    await session.flush()

    await publish_event(
        "MODEL_REGISTERED", tenant_id, model.id,
        {"name": data.name, "version": data.version},
    )
    return model


async def transition_model_stage(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    model_id: uuid.UUID,
    data: ModelVersionTransitionRequest,
) -> Optional[RegisteredModel]:
    result = await session.execute(
        select(RegisteredModel).where(
            and_(RegisteredModel.id == model_id, RegisteredModel.tenant_id == tenant_id, RegisteredModel.deleted_at.is_(None))
        )
    )
    model = result.scalar_one_or_none()
    if not model:
        return None

    old_stage = model.stage
    model.stage = data.stage
    await session.flush()

    event_type = "MODEL_PROMOTED" if data.stage == "Production" else "MODEL_STAGE_CHANGED"
    await publish_event(
        event_type, tenant_id, model.id,
        {"name": model.name, "version": model.version, "old_stage": old_stage, "new_stage": data.stage},
    )
    return model


async def get_model_version(
    session: AsyncSession, tenant_id: uuid.UUID, model_id: uuid.UUID
) -> Optional[RegisteredModel]:
    result = await session.execute(
        select(RegisteredModel).where(
            and_(RegisteredModel.id == model_id, RegisteredModel.tenant_id == tenant_id, RegisteredModel.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_model_versions(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[RegisteredModel]:
    result = await session.execute(
        select(RegisteredModel)
        .where(and_(RegisteredModel.tenant_id == tenant_id, RegisteredModel.deleted_at.is_(None)))
        .order_by(desc(RegisteredModel.created_at))
    )
    return list(result.scalars().all())
