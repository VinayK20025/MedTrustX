"""
app/db/repositories/vitals.py
==============================
Data-access layer for the ``patient_vitals`` table in the analytics_db.

All queries enforce multi-tenant isolation by requiring an active session
that has already had ``SET LOCAL app.tenant_id = '...'`` applied (via
``app.db.session.set_tenant_id``).  Callers MUST obtain the session via
``get_db()`` or ``get_db_session()`` — never bypass the session factory.

Assumed schema (existing, do not recreate):
    patient_vitals (
        id              UUID PRIMARY KEY,
        patient_id      UUID NOT NULL,
        tenant_id       TEXT NOT NULL,
        vital_type      TEXT NOT NULL,   -- 'Heart rate', 'SpO2', 'BP Systolic', etc.
        value           NUMERIC NOT NULL,
        unit            TEXT,
        recorded_at     TIMESTAMPTZ NOT NULL,
        encounter_id    UUID,
        source          TEXT             -- 'manual', 'device', 'ehr'
    )
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.observability.logging import get_logger
from app.observability.metrics import time_db_query

logger = get_logger(__name__)


class VitalsRepository:
    """
    All read/write operations against the ``patient_vitals`` table.

    Instantiate with an already-tenant-isolated ``AsyncSession``.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Patient vitals retrieval ───────────────────────────────────────────────
    async def get_patient_vitals(
        self,
        patient_id: str,
        lookback_days: int = 90,
    ) -> list[dict[str, Any]]:
        """
        Fetch all vital records for a patient from the past ``lookback_days``.

        Used by the feature store for readmission risk feature engineering.

        Args:
            patient_id:    Patient UUID string.
            lookback_days: Number of days back from now to retrieve.

        Returns:
            List of row dicts with keys: vital_type, value, recorded_at, unit.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(days=lookback_days)
        stmt = text(
            """
            SELECT
                vital_type,
                value::FLOAT       AS value,
                unit,
                recorded_at,
                encounter_id::TEXT AS encounter_id
            FROM patient_vitals
            WHERE patient_id = :patient_id
              AND recorded_at >= :cutoff
            ORDER BY recorded_at DESC
            """
        )
        with time_db_query("vitals", "get_patient_vitals"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt,
                    {"patient_id": patient_id, "cutoff": cutoff},
                )
        rows = result.mappings().all()
        return [dict(row) for row in rows]

    # ── Time-series aggregation ────────────────────────────────────────────────
    async def get_vitals_time_series(
        self,
        patient_id: str | None,
        vital_type: str,
        start_date: datetime,
        end_date: datetime,
        aggregation: str = "day",  # "hour" | "day" | "week"
        limit: int = 500,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """
        Return aggregated vital time-series using SQL DATE_TRUNC.

        Args:
            patient_id:   Optional patient filter; None returns tenant-wide data.
            vital_type:   Vital type string (e.g. "Heart rate").
            start_date:   Inclusive start of the date range.
            end_date:     Inclusive end of the date range.
            aggregation:  DATE_TRUNC granularity: "hour", "day", or "week".
            limit:        Maximum rows to return (pagination).
            offset:       Row offset (pagination).

        Returns:
            List of aggregated rows: bucket, avg_value, min_value, max_value,
            std_value, sample_count.
        """
        valid_agg = {"hour", "day", "week"}
        if aggregation not in valid_agg:
            raise ValueError(
                f"aggregation must be one of {valid_agg}, got {aggregation!r}"
            )

        patient_filter = (
            "AND patient_id = :patient_id" if patient_id is not None else ""
        )
        stmt = text(
            f"""
            SELECT
                DATE_TRUNC(:agg, recorded_at) AS bucket,
                AVG(value::FLOAT)             AS avg_value,
                MIN(value::FLOAT)             AS min_value,
                MAX(value::FLOAT)             AS max_value,
                STDDEV(value::FLOAT)          AS std_value,
                COUNT(*)                      AS sample_count
            FROM patient_vitals
            WHERE vital_type = :vital_type
              AND recorded_at BETWEEN :start_date AND :end_date
              {patient_filter}
            GROUP BY bucket
            ORDER BY bucket ASC
            LIMIT :limit OFFSET :offset
            """
        )
        params: dict[str, Any] = {
            "agg": aggregation,
            "vital_type": vital_type,
            "start_date": start_date,
            "end_date": end_date,
            "limit": limit,
            "offset": offset,
        }
        if patient_id is not None:
            params["patient_id"] = patient_id

        with time_db_query("vitals", "get_vitals_time_series"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(stmt, params)
        rows = result.mappings().all()
        return [dict(row) for row in rows]

    # ── Anomaly lookback ───────────────────────────────────────────────────────
    async def get_recent_vitals_for_anomaly(
        self,
        patient_id: str,
        lookback_hours: int = 24,
    ) -> list[dict[str, Any]]:
        """
        Fetch raw vitals for a patient within the last ``lookback_hours``.

        Used by the Z-score anomaly detection pipeline.

        Returns:
            List of rows with vital_type, value, recorded_at.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(hours=lookback_hours)
        stmt = text(
            """
            SELECT
                vital_type,
                value::FLOAT AS value,
                recorded_at
            FROM patient_vitals
            WHERE patient_id = :patient_id
              AND recorded_at >= :cutoff
            ORDER BY vital_type, recorded_at
            """
        )
        with time_db_query("vitals", "get_recent_vitals_for_anomaly"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt,
                    {"patient_id": patient_id, "cutoff": cutoff},
                )
        rows = result.mappings().all()
        return [dict(row) for row in rows]

    # ── Encounter count (readmission feature) ──────────────────────────────────
    async def count_encounters(
        self,
        patient_id: str,
        lookback_days: int = 90,
    ) -> int:
        """
        Count distinct encounter_ids for a patient in the past N days.

        Used as the ``num_encounters_90d`` feature for readmission scoring.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(days=lookback_days)
        stmt = text(
            """
            SELECT COUNT(DISTINCT encounter_id)
            FROM patient_vitals
            WHERE patient_id = :patient_id
              AND recorded_at >= :cutoff
              AND encounter_id IS NOT NULL
            """
        )
        with time_db_query("vitals", "count_encounters"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt,
                    {"patient_id": patient_id, "cutoff": cutoff},
                )
        row = result.scalar()
        return int(row) if row is not None else 0

    # ── Anomaly history (WebSocket replay on connect) ──────────────────────────
    async def get_recent_anomaly_events(
        self,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """
        Return the most recent high-value vital outliers across all patients
        in the tenant, for initial WebSocket replay on client connection.

        Uses a simple heuristic: vitals beyond the 99th percentile of the
        last 7 days' distribution qualify as potential anomaly events.

        Returns:
            List of rows: patient_id, vital_type, value, recorded_at.
        """
        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        stmt = text(
            """
            WITH recent AS (
                SELECT
                    patient_id::TEXT,
                    vital_type,
                    value::FLOAT            AS value,
                    recorded_at,
                    PERCENT_RANK() OVER (
                        PARTITION BY vital_type
                        ORDER BY value::FLOAT
                    ) AS pct_rank
                FROM patient_vitals
                WHERE recorded_at >= :cutoff
            )
            SELECT patient_id, vital_type, value, recorded_at
            FROM   recent
            WHERE  pct_rank >= 0.99
            ORDER  BY recorded_at DESC
            LIMIT  :limit
            """
        )
        with time_db_query("vitals", "get_recent_anomaly_events"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(stmt, {"cutoff": cutoff, "limit": limit})
        rows = result.mappings().all()
        return [dict(row) for row in rows]
