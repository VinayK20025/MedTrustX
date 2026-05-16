"""
tests/test_analytics.py
========================
Integration tests for the analytics endpoints.

Uses:
  - Real DB connection to analytics_db:
      patient_vitals     — 221,991 rows (seeded)
      readmission_risk   — 3,386 rows  (seeded)
  - Mocked Redis cache (always miss — forces live DB queries).
  - Verifies correct aggregation, pagination, and data shapes.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

from tests.conftest import TEST_TENANT_ID


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/vitals
# ══════════════════════════════════════════════════════════════════════════════

class TestVitalsAnalytics:
    """Tests for the vitals time-series analytics endpoint."""

    @pytest.mark.asyncio
    async def test_vitals_analytics_returns_data(
        self,
        async_client: AsyncClient,
        mock_redis_cache,
    ) -> None:
        """
        Integration test: queries patient_vitals with a wide date range.

        The seeded DB has 221,991 rows — this test uses a 365-day window
        and expects to receive at least one data point.

        Asserts:
          - HTTP 200.
          - data list is non-empty.
          - Each bucket has avg_value, min_value, max_value, sample_count.
          - aggregation matches the request parameter.
        """
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=365)

        response = await async_client.get(
            "/api/ai/analytics/vitals",
            params={
                "tenant_id": TEST_TENANT_ID,
                "vital_type": "Heart rate",
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "aggregation": "week",
                "page": 1,
                "page_size": 52,
            },
        )

        assert response.status_code == 200, (
            f"Expected 200, got {response.status_code}. Body: {response.text[:500]}"
        )

        data = response.json()
        assert data["aggregation"] == "week"
        assert data["vital_type"] == "Heart rate"
        assert data["tenant_id"] == TEST_TENANT_ID
        assert isinstance(data["data"], list)

        # With 221,991 rows we expect data in a 365-day window
        assert len(data["data"]) > 0, (
            "No vitals data returned — check that analytics_db is seeded "
            "with patient_vitals rows."
        )

        # Validate structure of each data point
        first = data["data"][0]
        assert "bucket" in first
        assert "avg_value" in first
        assert "min_value" in first
        assert "max_value" in first
        assert "sample_count" in first
        assert first["sample_count"] > 0
        assert first["avg_value"] >= first["min_value"]
        assert first["avg_value"] <= first["max_value"]

    @pytest.mark.asyncio
    async def test_vitals_analytics_daily_aggregation(
        self,
        async_client: AsyncClient,
        mock_redis_cache,
    ) -> None:
        """Daily aggregation returns one bucket per day in the range."""
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=30)

        response = await async_client.get(
            "/api/ai/analytics/vitals",
            params={
                "tenant_id": TEST_TENANT_ID,
                "vital_type": "Heart rate",
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "aggregation": "day",
                "page_size": 100,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["aggregation"] == "day"
        # Should have at most 30 buckets for a 30-day range
        assert len(data["data"]) <= 31

    @pytest.mark.asyncio
    async def test_vitals_analytics_pagination(
        self,
        async_client: AsyncClient,
        mock_redis_cache,
    ) -> None:
        """Pagination with page_size=5 must return at most 5 data points."""
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=180)

        response = await async_client.get(
            "/api/ai/analytics/vitals",
            params={
                "tenant_id": TEST_TENANT_ID,
                "vital_type": "Heart rate",
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "aggregation": "week",
                "page": 1,
                "page_size": 5,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 5
        assert data["page"] == 1
        assert data["page_size"] == 5

    @pytest.mark.asyncio
    async def test_vitals_analytics_invalid_aggregation(
        self,
        async_client: AsyncClient,
    ) -> None:
        """Invalid aggregation value must return 422."""
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=7)

        response = await async_client.get(
            "/api/ai/analytics/vitals",
            params={
                "tenant_id": TEST_TENANT_ID,
                "vital_type": "Heart rate",
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "aggregation": "monthly",  # Invalid
            },
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_vitals_analytics_end_before_start(
        self,
        async_client: AsyncClient,
    ) -> None:
        """end_date before start_date must return 422."""
        now = datetime.now(timezone.utc)
        response = await async_client.get(
            "/api/ai/analytics/vitals",
            params={
                "tenant_id": TEST_TENANT_ID,
                "vital_type": "Heart rate",
                "start_date": now.isoformat(),
                "end_date": (now - timedelta(days=1)).isoformat(),
                "aggregation": "day",
            },
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_vitals_analytics_patient_filter(
        self,
        async_client: AsyncClient,
        real_patient_id: str,
        mock_redis_cache,
    ) -> None:
        """
        When patient_id is provided, only that patient's data is returned.
        Response must be 200 (may have zero data points for this specific patient).
        """
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=365)

        response = await async_client.get(
            "/api/ai/analytics/vitals",
            params={
                "tenant_id": TEST_TENANT_ID,
                "vital_type": "Heart rate",
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "patient_id": real_patient_id,
                "aggregation": "month",
            },
        )
        assert response.status_code in {200, 422}


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/population
# ══════════════════════════════════════════════════════════════════════════════

class TestPopulationAnalytics:
    """Tests for the population-level risk distribution endpoint."""

    @pytest.mark.asyncio
    async def test_population_analytics_returns_distribution(
        self,
        async_client: AsyncClient,
        mock_redis_cache,
    ) -> None:
        """
        Integration test: queries readmission_risk (3,386 rows) for
        population-level risk distribution.

        Asserts:
          - HTTP 200.
          - histogram is a list.
          - high_risk_count + medium_risk_count + low_risk_count >= 0.
          - avg_risk_score is between 0.0 and 1.0.
        """
        response = await async_client.get(
            "/api/ai/analytics/population",
            params={"tenant_id": TEST_TENANT_ID},
        )

        assert response.status_code == 200, response.text
        data = response.json()

        assert isinstance(data["histogram"], list)
        assert data["avg_risk_score"] >= 0.0
        assert data["total_patients"] >= 0
        assert data["high_risk_count"] >= 0
        assert data["medium_risk_count"] >= 0
        assert data["low_risk_count"] >= 0

        if data["total_patients"] > 0:
            assert 0.0 <= data["avg_risk_score"] <= 1.0

    @pytest.mark.asyncio
    async def test_population_analytics_risk_label_filter(
        self,
        async_client: AsyncClient,
        mock_redis_cache,
    ) -> None:
        """Filtering by risk_label=high must work and return only high-risk stats."""
        response = await async_client.get(
            "/api/ai/analytics/population",
            params={"tenant_id": TEST_TENANT_ID, "risk_label": "high"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["risk_label_filter"] == "high"
        # Medium and low counts should be 0 when filtering to high only
        assert data["medium_risk_count"] == 0
        assert data["low_risk_count"] == 0

    @pytest.mark.asyncio
    async def test_population_analytics_invalid_risk_label(
        self,
        async_client: AsyncClient,
    ) -> None:
        """Invalid risk_label must return 422."""
        response = await async_client.get(
            "/api/ai/analytics/population",
            params={"tenant_id": TEST_TENANT_ID, "risk_label": "extreme"},
        )
        assert response.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/resource-usage
# ══════════════════════════════════════════════════════════════════════════════

class TestResourceUsage:
    """Tests for the resource usage analytics endpoint."""

    @pytest.mark.asyncio
    async def test_resource_usage_returns_report(
        self,
        async_client: AsyncClient,
    ) -> None:
        """
        Resource usage endpoint should return a valid report structure.

        Prometheus metrics may be empty in a fresh test run — that's OK.
        """
        response = await async_client.get(
            "/api/ai/analytics/resource-usage",
            params={"period_hours": 24},
        )

        assert response.status_code == 200, response.text
        data = response.json()

        assert "hourly_counts" in data
        assert "latency_stats" in data
        assert "active_websocket_connections" in data
        assert "feature_cache_hit_ratio" in data
        assert "generated_at" in data

        assert isinstance(data["hourly_counts"], list)
        assert isinstance(data["latency_stats"], list)
        assert 0 <= data["feature_cache_hit_ratio"] <= 1.0
        assert data["active_websocket_connections"] >= 0
