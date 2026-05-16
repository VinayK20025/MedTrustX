"""
app/db/repositories/risk.py
============================
Data-access layer for the ``readmission_risk`` table in analytics_db.

Handles reading and writing readmission risk scores computed by the
inference engine.  All queries enforce multi-tenant RLS via the session-level
``SET LOCAL app.tenant_id`` variable.

Assumed schema (existing, do not recreate):
    readmission_risk (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id      UUID NOT NULL,
        tenant_id       TEXT NOT NULL,
        risk_score      NUMERIC(6,4) NOT NULL,  -- 0.0000 – 1.0000
        risk_label      TEXT NOT NULL,           -- 'low', 'medium', 'high'
        confidence      NUMERIC(6,4),
        model_name      TEXT,
        model_version   TEXT,
        feature_vector  JSONB,
        explanation     JSONB,
        department      TEXT,
        computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        valid_until     TIMESTAMPTZ
    )
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.observability.logging import get_logger
from app.observability.metrics import time_db_query

logger = get_logger(__name__)


class RiskRepository:
    """
    All read/write operations against the ``readmission_risk`` table.

    Instantiate with a tenant-isolated ``AsyncSession`` obtained from
    ``app.db.session.get_db()`` or ``get_db_session()``.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Fetch latest risk for a patient ───────────────────────────────────────
    async def get_patient_risk(
        self,
        patient_id: str,
    ) -> dict[str, Any] | None:
        """
        Return the most recent risk record for a patient, or None if no
        record exists.

        Args:
            patient_id: Patient UUID string.

        Returns:
            Dict with all risk columns, or None.
        """
        stmt = text(
            """
            SELECT
                id::TEXT,
                patient_id::TEXT,
                risk_score::FLOAT,
                risk_label,
                confidence::FLOAT,
                model_name,
                model_version,
                feature_vector,
                explanation,
                department,
                computed_at,
                valid_until
            FROM readmission_risk
            WHERE patient_id = :patient_id
            ORDER BY computed_at DESC
            LIMIT 1
            """
        )
        with time_db_query("risk", "get_patient_risk"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt, {"patient_id": patient_id}
                )
        row = result.mappings().first()
        return dict(row) if row else None

    # ── Insert a new risk record ───────────────────────────────────────────────
    async def insert_risk_record(
        self,
        patient_id: str,
        tenant_id: str,
        risk_score: float,
        risk_label: str,
        confidence: float,
        model_name: str,
        model_version: str,
        feature_vector: dict[str, Any],
        explanation: dict[str, Any],
        department: str | None = None,
    ) -> str:
        """
        Insert a new readmission risk assessment into the table.

        Args:
            patient_id:     Patient UUID.
            tenant_id:      Tenant identifier (stored explicitly for audit).
            risk_score:     Float 0.0 – 1.0.
            risk_label:     One of "low", "medium", "high".
            confidence:     Model confidence score 0.0 – 1.0.
            model_name:     ML model name.
            model_version:  MLflow model version string.
            feature_vector: Dict of feature name → value used for inference.
            explanation:    Dict of SHAP-based explanation data.
            department:     Hospital department (optional).

        Returns:
            The UUID of the newly inserted row as a string.
        """
        new_id = str(uuid.uuid4())
        valid_until = datetime.now(timezone.utc) + timedelta(hours=24)

        stmt = text(
            """
            INSERT INTO readmission_risk (
                id, patient_id, tenant_id,
                risk_score, risk_label, confidence,
                model_name, model_version,
                feature_vector, explanation,
                department, computed_at, valid_until
            ) VALUES (
                :id, :patient_id, :tenant_id,
                :risk_score, :risk_label, :confidence,
                :model_name, :model_version,
                :feature_vector::JSONB, :explanation::JSONB,
                :department, NOW(), :valid_until
            )
            """
        )
        import json

        with time_db_query("risk", "insert_risk_record"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                await self._session.execute(
                    stmt,
                    {
                        "id": new_id,
                        "patient_id": patient_id,
                        "tenant_id": tenant_id,
                        "risk_score": risk_score,
                        "risk_label": risk_label,
                        "confidence": confidence,
                        "model_name": model_name,
                        "model_version": model_version,
                        "feature_vector": json.dumps(feature_vector),
                        "explanation": json.dumps(explanation),
                        "department": department,
                        "valid_until": valid_until,
                    },
                )

        logger.info(
            "Risk record inserted",
            extra={
                "record_id": new_id,
                "patient_id": patient_id,
                "risk_label": risk_label,
                "risk_score": risk_score,
            },
        )
        return new_id

    # ── Population-level risk distribution ────────────────────────────────────
    async def get_population_risk_distribution(
        self,
        risk_label: str | None = None,
        department: str | None = None,
    ) -> dict[str, Any]:
        """
        Aggregate risk scores across the tenant population for the analytics
        population endpoint.

        Args:
            risk_label:  Optional filter ("low", "medium", "high").
            department:  Optional department filter.

        Returns:
            Dict with: histogram (list of buckets), high_risk_count,
            avg_risk_score, label_distribution, trend_7d.
        """
        label_filter = "AND risk_label = :risk_label" if risk_label else ""
        dept_filter = "AND department = :department" if department else ""

        # Latest record per patient in the last 7 days
        stmt = text(
            f"""
            WITH latest AS (
                SELECT DISTINCT ON (patient_id)
                    patient_id,
                    risk_score::FLOAT AS risk_score,
                    risk_label,
                    department,
                    computed_at
                FROM readmission_risk
                WHERE computed_at >= NOW() - INTERVAL '7 days'
                {label_filter}
                {dept_filter}
                ORDER BY patient_id, computed_at DESC
            ),
            prev_week AS (
                SELECT DISTINCT ON (patient_id)
                    risk_score::FLOAT AS risk_score,
                    risk_label
                FROM readmission_risk
                WHERE computed_at BETWEEN NOW() - INTERVAL '14 days'
                                      AND NOW() - INTERVAL '7 days'
                {label_filter}
                {dept_filter}
                ORDER BY patient_id, computed_at DESC
            )
            SELECT
                -- Histogram: 10 buckets 0.0–1.0
                WIDTH_BUCKET(l.risk_score, 0, 1, 10)   AS bucket,
                COUNT(*)                                AS bucket_count,
                AVG(l.risk_score)                       AS avg_risk_score,
                SUM(CASE WHEN l.risk_label='high' THEN 1 ELSE 0 END)   AS high_risk_count,
                SUM(CASE WHEN l.risk_label='medium' THEN 1 ELSE 0 END) AS medium_risk_count,
                SUM(CASE WHEN l.risk_label='low' THEN 1 ELSE 0 END)    AS low_risk_count,
                (SELECT AVG(risk_score) FROM prev_week)                 AS prev_week_avg
            FROM latest l
            GROUP BY bucket
            ORDER BY bucket
            """
        )
        params: dict[str, Any] = {}
        if risk_label:
            params["risk_label"] = risk_label
        if department:
            params["department"] = department

        with time_db_query("risk", "get_population_risk_distribution"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(stmt, params)
        rows = result.mappings().all()

        # Post-process into frontend-friendly shape
        histogram = []
        total_high = 0
        total_medium = 0
        total_low = 0
        weighted_avg = 0.0
        total_count = 0
        prev_avg = None

        for row in rows:
            bucket_label_start = (row["bucket"] - 1) * 0.1
            bucket_label_end = row["bucket"] * 0.1
            histogram.append(
                {
                    "bucket": f"{bucket_label_start:.1f}–{bucket_label_end:.1f}",
                    "count": int(row["bucket_count"]),
                    "avg_risk_score": float(row["avg_risk_score"] or 0),
                }
            )
            total_high += int(row["high_risk_count"] or 0)
            total_medium += int(row["medium_risk_count"] or 0)
            total_low += int(row["low_risk_count"] or 0)
            weighted_avg += float(row["avg_risk_score"] or 0) * int(row["bucket_count"])
            total_count += int(row["bucket_count"])
            if row["prev_week_avg"] is not None:
                prev_avg = float(row["prev_week_avg"])

        overall_avg = weighted_avg / total_count if total_count > 0 else 0.0
        trend = None
        if prev_avg is not None and prev_avg > 0:
            trend = round(((overall_avg - prev_avg) / prev_avg) * 100, 2)

        return {
            "histogram": histogram,
            "high_risk_count": total_high,
            "medium_risk_count": total_medium,
            "low_risk_count": total_low,
            "avg_risk_score": round(overall_avg, 4),
            "total_patients": total_count,
            "trend_7d_pct": trend,
        }

    # ── List patients by risk label ────────────────────────────────────────────
    async def get_high_risk_patients(
        self,
        limit: int = 50,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """
        Return the most recently scored high-risk patients.

        Used for population analytics endpoint.
        """
        stmt = text(
            """
            SELECT DISTINCT ON (patient_id)
                patient_id::TEXT,
                risk_score::FLOAT,
                risk_label,
                confidence::FLOAT,
                model_name,
                computed_at
            FROM readmission_risk
            WHERE risk_label = 'high'
            ORDER BY patient_id, computed_at DESC
            LIMIT :limit OFFSET :offset
            """
        )
        with time_db_query("risk", "get_high_risk_patients"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt, {"limit": limit, "offset": offset}
                )
        rows = result.mappings().all()
        return [dict(row) for row in rows]

    # ── Sample a real patient_id for tests ────────────────────────────────────
    async def get_sample_patient_id(self) -> str | None:
        """
        Return a random patient_id that exists in readmission_risk.

        Used only by the test suite (conftest.py) to retrieve a seeded ID.
        """
        stmt = text(
            """
            SELECT patient_id::TEXT
            FROM readmission_risk
            ORDER BY RANDOM()
            LIMIT 1
            """
        )
        with time_db_query("risk", "get_sample_patient_id"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(stmt)
        row = result.scalar()
        return str(row) if row else None
