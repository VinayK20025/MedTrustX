"""
app/models/governance.py
=========================
Pydantic request/response schemas for the AI governance endpoints.

All models use ``model_config = ConfigDict(strict=True)``.

Endpoints covered:
  GET  /api/ai/governance/models
  POST /api/ai/governance/explain
  GET  /api/ai/governance/drift
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(strict=True, populate_by_name=True)


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/governance/models
# ═══════════════════════════════════════════════════════════════════════════════

class ModelMetrics(StrictModel):
    """Training and evaluation metrics for an MLflow registered model version."""

    accuracy: float | None = Field(None, description="Model accuracy on test set.")
    auc_roc: float | None = Field(None, description="AUC-ROC score.")
    f1_score: float | None = Field(None, description="F1 score on test set.")
    precision: float | None = Field(None, description="Precision on test set.")
    recall: float | None = Field(None, description="Recall on test set.")
    log_loss: float | None = Field(None, description="Log loss on test set.")
    train_samples: int | None = Field(None, description="Number of training samples.")
    eval_samples: int | None = Field(None, description="Number of evaluation samples.")


class RegisteredModelVersion(StrictModel):
    """A single registered model version from the MLflow model registry."""

    model_name: str = Field(..., description="Registered model name.")
    version: str = Field(..., description="Model version number.")
    stage: str = Field(
        ...,
        description="Deployment stage: 'None', 'Staging', 'Production', 'Archived'.",
    )
    description: str | None = Field(None, description="Version description.")
    metrics: ModelMetrics = Field(..., description="Training/evaluation metrics.")
    training_date: datetime | None = Field(None, description="Model training timestamp.")
    dataset_hash: str | None = Field(
        None,
        description="SHA-256 hash of the training dataset for lineage tracking.",
    )
    run_id: str | None = Field(None, description="MLflow run ID.")
    artifact_uri: str | None = Field(None, description="MLflow artifact URI.")
    tags: dict[str, str] = Field(
        default_factory=dict, description="MLflow model version tags."
    )


class ModelsListResponse(StrictModel):
    """Response from the governance models list endpoint."""

    models: list[RegisteredModelVersion] = Field(
        ..., description="All registered model versions from the MLflow registry."
    )
    total_count: int = Field(..., description="Total number of model versions.")
    registry_uri: str = Field(..., description="MLflow tracking server URI.")
    fetched_at: datetime = Field(..., description="UTC timestamp of this fetch.")


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/governance/explain
# ═══════════════════════════════════════════════════════════════════════════════

class ExplainRequest(StrictModel):
    """Input payload for the SHAP explanation endpoint."""

    patient_id: str = Field(
        ...,
        min_length=36,
        max_length=36,
        description="Patient UUID (36-char string).",
    )
    model_name: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Registered model name to explain (e.g. 'readmission').",
    )
    tenant_id: str = Field(
        ...,
        min_length=3,
        max_length=64,
        description="Tenant identifier.",
    )

    @field_validator("tenant_id")
    @classmethod
    def tenant_id_format(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("tenant_id must contain only alphanumeric characters, underscores, or hyphens.")
        return v


class WaterfallEntry(StrictModel):
    """A single entry in the SHAP waterfall chart data."""

    feature: str = Field(..., description="Feature name.")
    value: float = Field(..., description="Observed feature value.")
    shap_value: float = Field(..., description="SHAP contribution (signed).")
    cumulative: float = Field(..., description="Cumulative SHAP value up to this feature.")
    direction: str = Field(
        ...,
        description="Contribution direction: 'positive' or 'negative'.",
        pattern="^(positive|negative)$",
    )


class ExplainResponse(StrictModel):
    """SHAP explanation response for a single patient + model combination."""

    patient_id: str
    model_name: str
    tenant_id: str
    shap_values: dict[str, float] = Field(
        ...,
        description="Dict of feature_name → SHAP value for each input feature.",
    )
    feature_names: list[str] = Field(
        ..., description="Ordered list of feature names."
    )
    feature_values: dict[str, float] = Field(
        ..., description="Dict of feature_name → actual input value."
    )
    base_value: float = Field(
        ..., description="SHAP expected value (model output without any features)."
    )
    predicted_value: float = Field(
        ..., description="Model output for this patient (base_value + sum of SHAP values)."
    )
    waterfall_data: list[WaterfallEntry] = Field(
        ...,
        description="Ordered waterfall chart data (sorted by |SHAP value| descending).",
    )
    explained_at: datetime = Field(..., description="UTC timestamp of explanation.")


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/governance/drift
# ═══════════════════════════════════════════════════════════════════════════════

class FeatureDriftResult(StrictModel):
    """KS-test drift result for a single feature."""

    feature: str = Field(..., description="Feature name.")
    ks_statistic: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Kolmogorov-Smirnov statistic (0 = no drift, 1 = max drift).",
    )
    p_value: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="KS test p-value (< 0.05 indicates significant drift).",
    )
    drift_detected: bool = Field(
        ...,
        description="True when p_value < 0.05 (statistically significant drift).",
    )
    training_mean: float | None = Field(
        None, description="Mean of feature in training baseline."
    )
    current_mean: float | None = Field(
        None, description="Mean of feature in recent inference window."
    )
    training_std: float | None = Field(
        None, description="Std dev of feature in training baseline."
    )
    current_std: float | None = Field(
        None, description="Std dev of feature in recent inference window."
    )


class DriftDetectionResponse(StrictModel):
    """Model feature drift detection response."""

    model_name: str = Field(..., description="Model being evaluated for drift.")
    model_version: str = Field(..., description="Model version evaluated.")
    drift_detected: bool = Field(
        ...,
        description="True if ANY feature shows statistically significant drift.",
    )
    drifted_features: list[str] = Field(
        ...,
        description="List of feature names where drift was detected.",
    )
    ks_statistics: dict[str, float] = Field(
        ...,
        description="Dict of feature_name → KS statistic for all evaluated features.",
    )
    feature_results: list[FeatureDriftResult] = Field(
        ..., description="Detailed per-feature drift analysis."
    )
    recommendation: str = Field(
        ...,
        description="Governance recommendation based on drift findings.",
    )
    baseline_run_id: str | None = Field(
        None, description="MLflow run ID of the training baseline used."
    )
    inference_window_days: int = Field(
        ..., description="Number of days of recent inference data used."
    )
    evaluated_at: datetime = Field(..., description="UTC timestamp of drift evaluation.")
    samples_analysed: int = Field(..., description="Number of recent inference samples.")
