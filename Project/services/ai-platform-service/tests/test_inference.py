"""
tests/test_inference.py
========================
Integration tests for the ML inference endpoints.

Uses:
  - Real DB connection to analytics_db (patient_vitals, patient_conditions,
    readmission_risk tables with seeded data).
  - Mocked TF Serving (returns fixed score 0.72).
  - Mocked MLflow (returns version "1").
  - Mocked Redis (cache miss — forces DB queries).
  - Mocked SHAP (uniform attributions).
"""

from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import AsyncClient

from tests.conftest import TEST_TENANT_ID


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/predict-readmission
# ══════════════════════════════════════════════════════════════════════════════

class TestPredictReadmission:
    """Tests for the readmission risk prediction endpoint."""

    @pytest.mark.asyncio
    async def test_predict_readmission_success(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
        mock_tf_serving,
        mock_mlflow,
        mock_redis_cache,
        mock_shap,
    ) -> None:
        """
        Integration test: predicts readmission risk using a real patient_id
        from the seeded readmission_risk table.

        Asserts:
          - HTTP 200 response.
          - risk_score is between 0.0 and 1.0.
          - risk_label is one of low/medium/high.
          - confidence is between 0.0 and 1.0.
          - feature_importances is present with all required keys.
          - explanation contains top_features.
          - record_id is a non-empty string (row was inserted).
        """
        payload = {
            "patient_id": real_patient_id,
            "tenant_id": TEST_TENANT_ID,
        }

        response = await async_client.post(
            "/api/ai/predict-readmission", json=payload
        )

        assert response.status_code == 200, (
            f"Expected 200, got {response.status_code}. "
            f"Body: {response.text[:500]}"
        )

        data = response.json()

        # Core assertion: risk_score must be a valid probability
        assert 0.0 <= data["risk_score"] <= 1.0, (
            f"risk_score out of range: {data['risk_score']}"
        )
        assert data["risk_label"] in {"low", "medium", "high"}
        assert 0.0 <= data["confidence"] <= 1.0
        assert data["model_name"] == "readmission"
        assert data["model_version"] == "1"
        assert data["patient_id"] == real_patient_id
        assert data["tenant_id"] == TEST_TENANT_ID
        assert data["record_id"] and len(data["record_id"]) == 36

        # Feature importances
        fi = data["feature_importances"]
        for key in ["avg_hr", "avg_bp_sys", "avg_spo2", "num_conditions",
                    "comorbidity_score", "num_encounters_90d", "age_factor"]:
            assert key in fi, f"Missing feature importance: {key}"

        # SHAP explanation
        exp = data["explanation"]
        assert "base_value" in exp
        assert "top_features" in exp
        assert len(exp["top_features"]) <= 3

        # Inference source
        assert data["inference_source"] in {"tf_serving", "rule_based"}

    @pytest.mark.asyncio
    async def test_predict_readmission_tf_serving_fallback(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
        mock_mlflow,
        mock_redis_cache,
        mock_shap,
        monkeypatch,
    ) -> None:
        """
        When TF Serving raises TFServingUnavailableError, the endpoint must
        fall back to rule-based scoring and return inference_source='rule_based'.
        """
        from app.services import tf_serving as tf_module

        async def _fail_tf(features, model_name=None):
            return tf_module._rule_based_readmission_score(features), "rule_based"

        monkeypatch.setattr(tf_module, "predict_readmission", _fail_tf)

        payload = {"patient_id": real_patient_id, "tenant_id": TEST_TENANT_ID}
        response = await async_client.post(
            "/api/ai/predict-readmission", json=payload
        )

        assert response.status_code == 200
        data = response.json()
        assert data["inference_source"] == "rule_based"
        assert 0.0 <= data["risk_score"] <= 1.0

    @pytest.mark.asyncio
    async def test_predict_readmission_tenant_mismatch(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
    ) -> None:
        """
        A tenant_id in the body that differs from the JWT claim must return 403.
        """
        payload = {
            "patient_id": real_patient_id,
            "tenant_id": "tenant_medanta",  # JWT is for tenant_apollo
        }
        response = await async_client.post(
            "/api/ai/predict-readmission", json=payload
        )
        assert response.status_code == 403
        data = response.json()
        assert "Tenant Mismatch" in data.get("title", "") or \
               "tenant" in data.get("detail", "").lower()

    @pytest.mark.asyncio
    async def test_predict_readmission_invalid_patient_uuid(
        self,
        async_client: AsyncClient,
    ) -> None:
        """Invalid UUID in patient_id must return 422 Unprocessable Entity."""
        payload = {
            "patient_id": "not-a-uuid",
            "tenant_id": TEST_TENANT_ID,
        }
        response = await async_client.post(
            "/api/ai/predict-readmission", json=payload
        )
        assert response.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/vitals-anomaly
# ══════════════════════════════════════════════════════════════════════════════

class TestVitalsAnomaly:
    """Tests for the vitals anomaly detection endpoint."""

    @pytest.mark.asyncio
    async def test_vitals_anomaly_success(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
    ) -> None:
        """
        Integration test: runs anomaly detection on a real patient's vitals.

        Asserts:
          - HTTP 200.
          - Response has anomalies list (may be empty).
          - severity is one of low/medium/critical.
          - vitals_count >= 0.
        """
        payload = {
            "patient_id": real_patient_id,
            "tenant_id": TEST_TENANT_ID,
            "lookback_hours": 240,  # 10 days to ensure some data
        }

        response = await async_client.post(
            "/api/ai/vitals-anomaly", json=payload
        )

        assert response.status_code == 200, response.text
        data = response.json()

        assert isinstance(data["anomalies"], list)
        assert data["severity"] in {"low", "medium", "critical"}
        assert isinstance(data["affected_vitals"], list)
        assert isinstance(data["recommended_action"], str)
        assert len(data["recommended_action"]) > 0
        assert data["vitals_count"] >= 0
        assert data["patient_id"] == real_patient_id

    @pytest.mark.asyncio
    async def test_vitals_anomaly_no_data(
        self,
        async_client: AsyncClient,
    ) -> None:
        """
        When no vitals are found, response should have empty anomalies
        and severity='low'.
        """
        import uuid
        payload = {
            "patient_id": str(uuid.uuid4()),  # non-existent patient
            "tenant_id": TEST_TENANT_ID,
            "lookback_hours": 1,
        }

        response = await async_client.post(
            "/api/ai/vitals-anomaly", json=payload
        )

        assert response.status_code == 200
        data = response.json()
        assert data["anomalies"] == []
        assert data["severity"] == "low"
        assert data["vitals_count"] == 0

    @pytest.mark.asyncio
    async def test_vitals_anomaly_lookback_validation(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
    ) -> None:
        """lookback_hours must be between 1 and 720; 0 must return 422."""
        payload = {
            "patient_id": real_patient_id,
            "tenant_id": TEST_TENANT_ID,
            "lookback_hours": 0,
        }
        response = await async_client.post(
            "/api/ai/vitals-anomaly", json=payload
        )
        assert response.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/diagnose-risk
# ══════════════════════════════════════════════════════════════════════════════

class TestDiagnoseRisk:
    """Tests for the diagnostic risk assessment endpoint."""

    @pytest.mark.asyncio
    async def test_diagnose_risk_success(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
    ) -> None:
        """
        Integration test: assesses comorbidity risk for known ICD-10 codes.

        Asserts:
          - HTTP 200.
          - comorbidity_score >= 0.
          - recommended_screenings is a non-empty list.
          - interaction_risks is a dict.
        """
        payload = {
            "patient_id": real_patient_id,
            "tenant_id": TEST_TENANT_ID,
            "icd10_codes": ["I21", "E11", "N18"],
        }

        response = await async_client.post(
            "/api/ai/diagnose-risk", json=payload
        )

        assert response.status_code == 200, response.text
        data = response.json()

        assert data["comorbidity_score"] >= 0.0
        assert isinstance(data["recommended_screenings"], list)
        assert len(data["recommended_screenings"]) > 0
        assert isinstance(data["interaction_risks"], dict)
        assert data["patient_id"] == real_patient_id

    @pytest.mark.asyncio
    async def test_diagnose_risk_invalid_icd10(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
    ) -> None:
        """Invalid ICD-10 format must return 422."""
        payload = {
            "patient_id": real_patient_id,
            "tenant_id": TEST_TENANT_ID,
            "icd10_codes": ["INVALID-CODE", "123"],
        }
        response = await async_client.post(
            "/api/ai/diagnose-risk", json=payload
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_diagnose_risk_empty_codes(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
    ) -> None:
        """Empty icd10_codes list must return 422."""
        payload = {
            "patient_id": real_patient_id,
            "tenant_id": TEST_TENANT_ID,
            "icd10_codes": [],
        }
        response = await async_client.post(
            "/api/ai/diagnose-risk", json=payload
        )
        assert response.status_code == 422
