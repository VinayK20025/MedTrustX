"""
tests/test_governance.py
=========================
Tests for the AI governance endpoints.

Uses:
  - Mocked MLflow client.
  - Mocked SHAP computation.
  - Real DB for feature vector computation (conditions + vitals).
  - Mocked Redis.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_TENANT_ID


class TestGovernanceModels:
    """Tests for GET /api/ai/governance/models."""

    @pytest.mark.asyncio
    async def test_list_models_returns_structure(
        self,
        async_client: AsyncClient,
        mock_mlflow,
    ) -> None:
        """
        MLflow model list endpoint must return a valid ModelsListResponse.
        With mocked MLflow returning empty list, total_count should be 0.
        """
        response = await async_client.get("/api/ai/governance/models")
        assert response.status_code == 200, response.text

        data = response.json()
        assert "models" in data
        assert "total_count" in data
        assert "registry_uri" in data
        assert "fetched_at" in data
        assert isinstance(data["models"], list)
        assert data["total_count"] == len(data["models"])

    @pytest.mark.asyncio
    async def test_list_models_mlflow_unavailable(
        self,
        async_client: AsyncClient,
        monkeypatch,
    ) -> None:
        """
        When MLflow is unavailable, endpoint should still return 200
        with an empty models list (graceful degradation).
        """
        from app.services import mlflow_client

        async def _fail():
            raise RuntimeError("MLflow unavailable")

        monkeypatch.setattr(mlflow_client, "list_registered_models", _fail)

        response = await async_client.get("/api/ai/governance/models")
        assert response.status_code == 200
        data = response.json()
        assert data["models"] == []
        assert data["total_count"] == 0


class TestGovernanceExplain:
    """Tests for POST /api/ai/governance/explain."""

    @pytest.mark.asyncio
    async def test_explain_returns_shap_values(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
        mock_shap,
        mock_redis_cache,
        mock_mlflow,
    ) -> None:
        """
        SHAP explanation endpoint must return waterfall data with all required fields.

        Asserts:
          - HTTP 200.
          - shap_values is a dict with all 11 feature names.
          - waterfall_data is a list of WaterfallEntry objects.
          - base_value is a float.
          - predicted_value is between 0.0 and 1.0.
        """
        payload = {
            "patient_id": real_patient_id,
            "model_name": "readmission",
            "tenant_id": TEST_TENANT_ID,
        }

        response = await async_client.post(
            "/api/ai/governance/explain", json=payload
        )

        assert response.status_code == 200, (
            f"Expected 200, got {response.status_code}. Body: {response.text[:500]}"
        )

        data = response.json()

        assert "shap_values" in data
        assert "feature_names" in data
        assert "waterfall_data" in data
        assert "base_value" in data
        assert "predicted_value" in data

        # All 11 features must be present in shap_values
        expected_features = {
            "avg_hr", "std_hr", "avg_bp_sys", "avg_bp_dia", "avg_spo2",
            "avg_bmi", "num_vitals_recorded", "num_conditions",
            "comorbidity_score", "num_encounters_90d", "age_factor",
        }
        assert set(data["shap_values"].keys()) == expected_features

        # Waterfall data structure
        assert isinstance(data["waterfall_data"], list)
        for entry in data["waterfall_data"]:
            assert "feature" in entry
            assert "shap_value" in entry
            assert "direction" in entry
            assert entry["direction"] in {"positive", "negative"}

        # predicted_value sanity check
        assert 0.0 <= data["predicted_value"] <= 1.0

    @pytest.mark.asyncio
    async def test_explain_invalid_patient_uuid(
        self,
        async_client: AsyncClient,
    ) -> None:
        """patient_id that is not 36 chars must return 422."""
        payload = {
            "patient_id": "too-short",
            "model_name": "readmission",
            "tenant_id": TEST_TENANT_ID,
        }
        response = await async_client.post(
            "/api/ai/governance/explain", json=payload
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_explain_tenant_mismatch(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
    ) -> None:
        """Tenant mismatch must return 403."""
        payload = {
            "patient_id": real_patient_id,
            "model_name": "readmission",
            "tenant_id": "tenant_medanta",
        }
        response = await async_client.post(
            "/api/ai/governance/explain", json=payload
        )
        assert response.status_code == 403


class TestGovernanceDrift:
    """Tests for GET /api/ai/governance/drift."""

    @pytest.mark.asyncio
    async def test_drift_detection_returns_results(
        self,
        async_client: AsyncClient,
        mock_mlflow,
    ) -> None:
        """
        Drift detection endpoint must return a DriftDetectionResponse with
        all 11 features evaluated and a recommendation string.
        """
        response = await async_client.get(
            "/api/ai/governance/drift",
            params={"model_name": "readmission", "window_days": 7},
        )

        assert response.status_code == 200, response.text
        data = response.json()

        assert "drift_detected" in data
        assert "drifted_features" in data
        assert "ks_statistics" in data
        assert "feature_results" in data
        assert "recommendation" in data

        assert isinstance(data["drift_detected"], bool)
        assert isinstance(data["drifted_features"], list)
        assert isinstance(data["ks_statistics"], dict)
        assert len(data["recommendation"]) > 0

        # All 11 features must have KS statistics
        expected_features = {
            "avg_hr", "std_hr", "avg_bp_sys", "avg_bp_dia", "avg_spo2",
            "avg_bmi", "num_vitals_recorded", "num_conditions",
            "comorbidity_score", "num_encounters_90d", "age_factor",
        }
        assert set(data["ks_statistics"].keys()) == expected_features

        # Each KS statistic must be in [0, 1]
        for feat, ks_val in data["ks_statistics"].items():
            assert 0.0 <= ks_val <= 1.0, f"KS statistic out of range for {feat}: {ks_val}"

        # Feature results structure
        for fr in data["feature_results"]:
            assert "feature" in fr
            assert "ks_statistic" in fr
            assert "p_value" in fr
            assert "drift_detected" in fr
            assert 0.0 <= fr["ks_statistic"] <= 1.0
            assert 0.0 <= fr["p_value"] <= 1.0

    @pytest.mark.asyncio
    async def test_drift_detection_window_days_validation(
        self,
        async_client: AsyncClient,
    ) -> None:
        """window_days > 90 must return 422."""
        response = await async_client.get(
            "/api/ai/governance/drift",
            params={"model_name": "readmission", "window_days": 365},
        )
        assert response.status_code == 422
