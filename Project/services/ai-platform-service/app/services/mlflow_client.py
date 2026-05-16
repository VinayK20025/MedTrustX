"""
app/services/mlflow_client.py
==============================
MLflow model registry client for the MedTrustX AI Platform Service.

Responsibilities:
  - List all registered model versions from the MLflow tracking server.
  - Fetch training metrics, dataset hash, and tags for each version.
  - Retrieve baseline feature statistics for drift detection.
  - Expose the ``get_latest_model_version()`` helper for inference routing.

This client uses the MLflow Python SDK in a thread pool to avoid blocking
the async event loop (the SDK is synchronous).
"""

from __future__ import annotations

import asyncio
import functools
from datetime import datetime, timezone
from typing import Any

import mlflow
from mlflow.exceptions import MlflowException
from mlflow.tracking import MlflowClient

from app.config import settings
from app.models.governance import ModelMetrics, RegisteredModelVersion
from app.observability.logging import get_logger
from app.observability.metrics import MLFLOW_REQUESTS

logger = get_logger(__name__)

# MLflow SDK is synchronous — run in thread pool to avoid blocking event loop
_executor = None  # Uses default ThreadPoolExecutor


def _get_sync_client() -> MlflowClient:
    """Return a configured synchronous MlflowClient."""
    mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
    return MlflowClient(tracking_uri=settings.mlflow_tracking_uri)


async def _run_sync(func: Any, *args: Any, **kwargs: Any) -> Any:
    """Run a synchronous MLflow SDK function in the default thread pool."""
    loop = asyncio.get_running_loop()
    bound = functools.partial(func, *args, **kwargs)
    return await loop.run_in_executor(None, bound)


# ─── Helper: parse MLflow run metrics ─────────────────────────────────────────
def _parse_model_metrics(run_data: Any) -> ModelMetrics:
    """Extract standard evaluation metrics from an MLflow run's metrics dict."""
    if run_data is None:
        return ModelMetrics()
    metrics = getattr(run_data, "metrics", {}) or {}
    tags = getattr(run_data, "tags", {}) or {}

    return ModelMetrics(
        accuracy=metrics.get("accuracy") or metrics.get("test_accuracy"),
        auc_roc=metrics.get("auc_roc") or metrics.get("roc_auc"),
        f1_score=metrics.get("f1_score") or metrics.get("f1"),
        precision=metrics.get("precision") or metrics.get("test_precision"),
        recall=metrics.get("recall") or metrics.get("test_recall"),
        log_loss=metrics.get("log_loss"),
        train_samples=int(metrics["train_samples"]) if "train_samples" in metrics else None,
        eval_samples=int(metrics["eval_samples"]) if "eval_samples" in metrics else None,
    )


def _parse_timestamp(ts_ms: int | None) -> datetime | None:
    """Convert MLflow millisecond timestamp to UTC datetime."""
    if ts_ms is None:
        return None
    return datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)


# ─── Public API ────────────────────────────────────────────────────────────────

async def list_registered_models() -> list[RegisteredModelVersion]:
    """
    Return all registered model versions from the MLflow registry.

    Fetches each version's associated run to retrieve training metrics,
    dataset hash (from tags), and training date.

    Returns:
        List of ``RegisteredModelVersion`` objects sorted by model name + version.
    """
    client = _get_sync_client()

    def _fetch_all() -> list[RegisteredModelVersion]:
        versions: list[RegisteredModelVersion] = []
        try:
            registered = client.search_registered_models()
        except MlflowException as exc:
            MLFLOW_REQUESTS.labels(operation="list_models", status="error").inc()
            raise RuntimeError(f"MLflow list_registered_models failed: {exc}") from exc

        for rm in registered:
            for mv in rm.latest_versions:
                # Fetch run data for metrics
                run_data = None
                if mv.run_id:
                    try:
                        run = client.get_run(mv.run_id)
                        run_data = run.data
                    except MlflowException:
                        pass

                metrics = _parse_model_metrics(run_data)
                tags = dict(mv.tags or {})
                training_ts = _parse_timestamp(
                    mv.creation_timestamp
                )

                versions.append(
                    RegisteredModelVersion(
                        model_name=rm.name,
                        version=str(mv.version),
                        stage=mv.current_stage,
                        description=mv.description or rm.description,
                        metrics=metrics,
                        training_date=training_ts,
                        dataset_hash=tags.get("dataset_hash"),
                        run_id=mv.run_id,
                        artifact_uri=mv.source,
                        tags={k: str(v) for k, v in tags.items()},
                    )
                )

        MLFLOW_REQUESTS.labels(operation="list_models", status="success").inc()
        return sorted(versions, key=lambda x: (x.model_name, x.version))

    return await _run_sync(_fetch_all)


async def get_latest_model_version(model_name: str, stage: str = "Production") -> str:
    """
    Return the latest version string for a model in the given stage.

    Falls back to the most recent version if no model is in the requested stage.

    Args:
        model_name: Registered model name.
        stage:      MLflow stage (default "Production").

    Returns:
        Version string (e.g. "3").
    """
    client = _get_sync_client()

    def _fetch() -> str:
        try:
            versions = client.get_latest_versions(model_name, stages=[stage])
            if versions:
                MLFLOW_REQUESTS.labels(operation="get_version", status="success").inc()
                return str(versions[0].version)
            # Fall back: latest version in any stage
            versions = client.get_latest_versions(model_name)
            if versions:
                MLFLOW_REQUESTS.labels(operation="get_version", status="success").inc()
                return str(versions[0].version)
            MLFLOW_REQUESTS.labels(operation="get_version", status="not_found").inc()
            return "unknown"
        except MlflowException as exc:
            MLFLOW_REQUESTS.labels(operation="get_version", status="error").inc()
            logger.warning(
                "Could not retrieve MLflow model version",
                extra={"model": model_name, "error": str(exc)},
            )
            return "unknown"

    return await _run_sync(_fetch)


async def get_training_baseline(
    model_name: str,
    model_version: str,
) -> dict[str, Any] | None:
    """
    Retrieve the training-time feature distribution baseline from MLflow.

    The baseline is stored as an artifact (``feature_baseline.json``) in the
    run associated with the model version.  It contains per-feature mean and
    std from the training dataset — used by the drift detector.

    Args:
        model_name:    Registered model name.
        model_version: Version string.

    Returns:
        Dict of {feature_name: {mean: float, std: float, samples: list[float]}},
        or None if no baseline artifact exists.
    """
    import json
    import tempfile
    import os

    client = _get_sync_client()

    def _fetch() -> dict[str, Any] | None:
        try:
            mv = client.get_model_version(model_name, model_version)
            if not mv.run_id:
                return None

            # Download baseline artifact to a temp file
            with tempfile.TemporaryDirectory() as tmpdir:
                try:
                    local_path = client.download_artifacts(
                        mv.run_id, "feature_baseline.json", tmpdir
                    )
                    with open(local_path) as f:
                        baseline = json.load(f)
                    MLFLOW_REQUESTS.labels(operation="get_baseline", status="success").inc()
                    return baseline
                except MlflowException:
                    # Artifact not found — return synthetic baseline from run metrics
                    run = client.get_run(mv.run_id)
                    metrics = run.data.metrics or {}
                    # Reconstruct baseline from metrics if artifact is absent
                    synthetic: dict[str, Any] = {}
                    feature_names = [
                        "avg_hr", "std_hr", "avg_bp_sys", "avg_bp_dia",
                        "avg_spo2", "avg_bmi", "num_vitals_recorded",
                        "num_conditions", "comorbidity_score",
                        "num_encounters_90d", "age_factor",
                    ]
                    for feat in feature_names:
                        mean_key = f"baseline_{feat}_mean"
                        std_key = f"baseline_{feat}_std"
                        if mean_key in metrics:
                            synthetic[feat] = {
                                "mean": float(metrics[mean_key]),
                                "std": float(metrics.get(std_key, 1.0)),
                                "samples": [],
                            }
                    MLFLOW_REQUESTS.labels(operation="get_baseline", status="synthetic").inc()
                    return synthetic if synthetic else None
        except MlflowException as exc:
            MLFLOW_REQUESTS.labels(operation="get_baseline", status="error").inc()
            logger.warning(
                "Could not fetch training baseline from MLflow",
                extra={"model": model_name, "version": model_version, "error": str(exc)},
            )
            return None

    return await _run_sync(_fetch)


async def log_inference_result(
    model_name: str,
    patient_id: str,
    tenant_id: str,
    features: dict[str, float],
    prediction: float,
) -> None:
    """
    Log a single inference result to MLflow as a run metric.

    This creates a lightweight audit trail of production inference events
    in the MLflow tracking server for drift monitoring.

    Args:
        model_name:  Model name.
        patient_id:  Patient UUID (anonymised in logs).
        tenant_id:   Tenant identifier.
        features:    Feature dict.
        prediction:  Model output score.
    """
    import hashlib

    # Anonymise patient_id before logging to MLflow
    anon_id = hashlib.sha256(f"{tenant_id}:{patient_id}".encode()).hexdigest()[:12]
    client = _get_sync_client()

    def _log() -> None:
        try:
            # Find or create a dedicated inference-log experiment
            exp_name = f"inference-log-{model_name}"
            exp = client.get_experiment_by_name(exp_name)
            if exp is None:
                exp_id = client.create_experiment(exp_name)
            else:
                exp_id = exp.experiment_id

            with mlflow.start_run(experiment_id=exp_id, run_name=anon_id):
                mlflow.log_param("model_name", model_name)
                mlflow.log_param("tenant_id", tenant_id)
                mlflow.log_param("anon_patient_id", anon_id)
                mlflow.log_metrics({
                    "prediction": prediction,
                    **{k: float(v) for k, v in features.items()},
                })
        except Exception as exc:  # noqa: BLE001
            # Logging failure must never affect the inference response
            logger.warning(
                "MLflow inference log failed",
                extra={"model": model_name, "error": str(exc)},
            )

    # Fire-and-forget in thread pool
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, _log)
