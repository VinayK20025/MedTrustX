"""
app/models/inference.py
========================
Pydantic request/response schemas for the ML inference endpoints.

All models use ``model_config = ConfigDict(strict=True)`` as required by the
production specification. This means Pydantic will not silently coerce types
(e.g., it will NOT convert a string "0.85" to float 0.85).

Endpoints covered:
  POST /api/ai/predict-readmission
  POST /api/ai/vitals-anomaly
  POST /api/ai/diagnose-risk
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ─── Shared base ──────────────────────────────────────────────────────────────
class StrictModel(BaseModel):
    """Base model with strict mode enabled for all inference schemas."""

    model_config = ConfigDict(strict=True, populate_by_name=True)


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/predict-readmission
# ═══════════════════════════════════════════════════════════════════════════════

class ReadmissionPredictRequest(StrictModel):
    """Input payload for the readmission risk prediction endpoint."""

    patient_id: UUID = Field(
        ...,
        description="Patient UUID to run readmission risk prediction for.",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    tenant_id: str = Field(
        ...,
        min_length=3,
        max_length=64,
        description="Tenant identifier — must match the JWT claim.",
        examples=["tenant_apollo"],
    )

    @field_validator("tenant_id")
    @classmethod
    def tenant_id_format(cls, v: str) -> str:
        """Validate that tenant_id only contains safe characters."""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError(
                "tenant_id must contain only alphanumeric characters, "
                "underscores, or hyphens."
            )
        return v


class FeatureImportances(StrictModel):
    """SHAP-derived feature importance values for readmission prediction."""

    avg_hr: float = Field(..., description="Average heart rate (last 90 days).")
    avg_bp_sys: float = Field(..., description="Average systolic blood pressure.")
    avg_spo2: float = Field(..., description="Average SpO2 saturation.")
    num_conditions: float = Field(..., description="Number of active conditions.")
    comorbidity_score: float = Field(..., description="Charlson Comorbidity Index score.")
    num_encounters_90d: float = Field(..., description="Encounter count in last 90 days.")
    age_factor: float = Field(..., description="Age-derived risk factor.")


class SHAPExplanation(StrictModel):
    """SHAP-based explanation of the top contributing features."""

    base_value: float = Field(..., description="SHAP base value (expected model output).")
    top_features: list[dict[str, Any]] = Field(
        ...,
        description="Top 3 features by |SHAP value|: [{feature, shap_value, value}].",
        max_length=3,
    )
    prediction_delta: float = Field(
        ...,
        description="Sum of top feature SHAP values (deviation from base_value).",
    )


class ReadmissionPredictResponse(StrictModel):
    """Response payload from the readmission risk prediction endpoint."""

    patient_id: str = Field(..., description="Patient UUID as string.")
    tenant_id: str = Field(..., description="Tenant identifier.")
    risk_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Predicted readmission risk score (0.0 = lowest, 1.0 = highest).",
    )
    risk_label: str = Field(
        ...,
        description="Risk category: 'low' (<0.3), 'medium' (0.3–0.6), 'high' (>0.6).",
        pattern="^(low|medium|high)$",
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model confidence in the prediction.",
    )
    feature_importances: FeatureImportances = Field(
        ...,
        description="SHAP-derived feature importance values.",
    )
    model_version: str = Field(
        ...,
        description="MLflow model version string used for this prediction.",
    )
    model_name: str = Field(..., description="ML model name.")
    explanation: SHAPExplanation = Field(
        ...,
        description="SHAP waterfall explanation (top 3 features).",
    )
    record_id: str = Field(
        ...,
        description="UUID of the written readmission_risk row.",
    )
    inference_source: str = Field(
        ...,
        description="'tf_serving' or 'rule_based' (fallback).",
        pattern="^(tf_serving|rule_based)$",
    )
    computed_at: datetime = Field(..., description="UTC timestamp of inference.")


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/vitals-anomaly
# ═══════════════════════════════════════════════════════════════════════════════

class VitalsAnomalyRequest(StrictModel):
    """Input payload for the vitals anomaly detection endpoint."""

    patient_id: UUID = Field(
        ...,
        description="Patient UUID to analyse for vital sign anomalies.",
    )
    tenant_id: str = Field(
        ...,
        min_length=3,
        max_length=64,
        description="Tenant identifier.",
    )
    lookback_hours: int = Field(
        default=24,
        ge=1,
        le=720,
        description="Hours of vitals history to analyse (default 24, max 720).",
    )

    @field_validator("tenant_id")
    @classmethod
    def tenant_id_format(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("tenant_id must contain only alphanumeric characters, underscores, or hyphens.")
        return v


class AnomalyEvent(StrictModel):
    """A single detected anomaly event in a patient's vitals."""

    vital_type: str = Field(..., description="Type of vital (e.g. 'Heart rate').")
    value: float = Field(..., description="Observed vital value.")
    z_score: float = Field(..., description="Z-score: (value - mean) / std.")
    mean: float = Field(..., description="Mean of the vital type in the lookback window.")
    std: float = Field(..., description="Standard deviation of the vital type.")
    unit: str = Field(default="", description="Measurement unit.")
    recorded_at: datetime = Field(..., description="UTC timestamp of the observation.")
    severity_contribution: str = Field(
        ...,
        description="Contribution to overall severity: 'low', 'medium', 'critical'.",
        pattern="^(low|medium|critical)$",
    )


class VitalsAnomalyResponse(StrictModel):
    """Response payload from the vitals anomaly detection endpoint."""

    patient_id: str = Field(..., description="Patient UUID.")
    tenant_id: str = Field(..., description="Tenant identifier.")
    lookback_hours: int = Field(..., description="Actual lookback window used.")
    anomalies: list[AnomalyEvent] = Field(
        ...,
        description="List of detected anomaly events (empty if none).",
    )
    severity: str = Field(
        ...,
        description="Overall severity: 'low', 'medium', or 'critical'.",
        pattern="^(low|medium|critical)$",
    )
    affected_vitals: list[str] = Field(
        ...,
        description="List of vital types with anomalies detected.",
    )
    recommended_action: str = Field(
        ...,
        description="Clinical action recommendation based on severity.",
    )
    inference_source: str = Field(
        ...,
        description="'tf_serving' or 'rule_based' (fallback).",
        pattern="^(tf_serving|rule_based)$",
    )
    analysed_at: datetime = Field(..., description="UTC timestamp of analysis.")
    vitals_count: int = Field(..., description="Total vitals records analysed.")


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/diagnose-risk
# ═══════════════════════════════════════════════════════════════════════════════

class DiagnoseRiskRequest(StrictModel):
    """Input payload for the diagnostic risk assessment endpoint."""

    patient_id: UUID = Field(
        ...,
        description="Patient UUID to assess diagnostic risk for.",
    )
    tenant_id: str = Field(
        ...,
        min_length=3,
        max_length=64,
        description="Tenant identifier.",
    )
    icd10_codes: list[str] = Field(
        ...,
        min_length=1,
        max_length=20,
        description="List of ICD-10 codes to assess interaction risks for.",
        examples=[["I21", "E11", "N18"]],
    )

    @field_validator("tenant_id")
    @classmethod
    def tenant_id_format(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("tenant_id must contain only alphanumeric characters, underscores, or hyphens.")
        return v

    @field_validator("icd10_codes")
    @classmethod
    def validate_icd10_format(cls, codes: list[str]) -> list[str]:
        """Validate that each code matches the ICD-10 prefix pattern."""
        import re
        pattern = re.compile(r"^[A-Z]\d{2}(\.\d{1,4})?$", re.IGNORECASE)
        for code in codes:
            if not pattern.match(code.strip()):
                raise ValueError(
                    f"Invalid ICD-10 code format: {code!r}. "
                    "Expected format: A00 or A00.0"
                )
        return [c.strip().upper() for c in codes]


class RiskFactor(StrictModel):
    """A single clinical risk factor for the diagnose-risk response."""

    icd10_code: str = Field(..., description="ICD-10 code.")
    description: str = Field(..., description="Condition description.")
    severity: str = Field(..., description="Risk severity contribution.")
    charlson_weight: int = Field(..., description="Charlson index weight (0 if not mapped).")


class DiagnoseRiskResponse(StrictModel):
    """Response payload from the diagnostic risk assessment endpoint."""

    patient_id: str = Field(..., description="Patient UUID.")
    tenant_id: str = Field(..., description="Tenant identifier.")
    submitted_codes: list[str] = Field(..., description="ICD-10 codes submitted.")
    risk_factors: list[RiskFactor] = Field(
        ...,
        description="Identified risk factors from the patient's conditions.",
    )
    interaction_risks: dict[str, Any] = Field(
        ...,
        description="Co-occurrence risk matrix: {icd10_code: {co_code: frequency}}.",
    )
    comorbidity_score: float = Field(
        ...,
        ge=0.0,
        description="Charlson Comorbidity Index for this patient.",
    )
    recommended_screenings: list[str] = Field(
        ...,
        description="Recommended clinical screenings based on condition interactions.",
    )
    assessed_at: datetime = Field(..., description="UTC timestamp of assessment.")
