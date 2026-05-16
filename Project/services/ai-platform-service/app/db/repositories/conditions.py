"""
app/db/repositories/conditions.py
===================================
Data-access layer for the ``patient_conditions`` table in analytics_db.

All queries enforce multi-tenant isolation through the session-level
``SET LOCAL app.tenant_id`` RLS policy.

Assumed schema (existing, do not recreate):
    patient_conditions (
        id              UUID PRIMARY KEY,
        patient_id      UUID NOT NULL,
        tenant_id       TEXT NOT NULL,
        icd10_code      TEXT NOT NULL,
        description     TEXT,
        onset_date      DATE,
        resolution_date DATE,        -- NULL means still active
        severity        TEXT,        -- 'mild', 'moderate', 'severe'
        is_primary      BOOLEAN,
        recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
"""

from __future__ import annotations

import asyncio
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.observability.logging import get_logger
from app.observability.metrics import time_db_query

logger = get_logger(__name__)

# ── Charlson Comorbidity Index approximation ──────────────────────────────────
# Maps ICD-10 code prefixes to Charlson weights.
# Source: Charlson ME et al. (1987), adapted for ICD-10.
CHARLSON_WEIGHTS: dict[str, int] = {
    # Score 1
    "I21": 1, "I22": 1,   # Myocardial infarction
    "I50": 1,             # Congestive heart failure
    "I70": 1, "I71": 1,   # Peripheral vascular disease
    "I60": 1, "I61": 1, "I62": 1, "I63": 1, "I64": 1,  # Cerebrovascular disease
    "F00": 1, "F01": 1, "F02": 1, "F03": 1,  # Dementia
    "J40": 1, "J41": 1, "J42": 1, "J43": 1, "J44": 1, "J45": 1,  # COPD
    "M05": 1, "M06": 1,   # Rheumatic disease
    "K25": 1, "K26": 1,   # Peptic ulcer disease
    "K70": 1, "K71": 1, "K72": 1, "K73": 1, "K74": 1,  # Mild liver disease
    "E10": 1, "E11": 1, "E13": 1, "E14": 1,  # Diabetes without complications
    # Score 2
    "G81": 2, "G82": 2,   # Hemiplegia / paraplegia
    "N18": 2, "N19": 2,   # Moderate/severe renal disease
    "E10_CC": 2,          # Diabetes with complications
    "C00": 2, "C01": 2, "C02": 2,  # Any tumour
    # Score 3
    "K76": 3,             # Moderate/severe liver disease
    # Score 6
    "C77": 6, "C78": 6, "C79": 6, "C80": 6,  # Metastatic solid tumour
    "B20": 6, "B21": 6, "B22": 6, "B24": 6,  # AIDS
}


def _compute_charlson(icd10_codes: list[str]) -> float:
    """
    Approximate the Charlson Comorbidity Index from a list of ICD-10 codes.

    Looks up each code's 3-character prefix against CHARLSON_WEIGHTS and sums
    the highest matching weight per condition category (to avoid double-counting).

    Returns:
        Float Charlson score (not age-adjusted).
    """
    seen_prefixes: set[str] = set()
    total_score = 0
    for code in icd10_codes:
        prefix = code[:3].upper()
        if prefix not in seen_prefixes:
            seen_prefixes.add(prefix)
            total_score += CHARLSON_WEIGHTS.get(prefix, 0)
    return float(total_score)


class ConditionsRepository:
    """
    All read operations against the ``patient_conditions`` table.

    Instantiate with a tenant-isolated ``AsyncSession`` obtained from
    ``app.db.session.get_db()`` or ``get_db_session()``.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Active conditions ──────────────────────────────────────────────────────
    async def get_active_conditions(
        self,
        patient_id: str,
    ) -> list[dict[str, Any]]:
        """
        Return all currently active conditions (``resolution_date IS NULL``)
        for a patient, ordered by onset date descending.

        Args:
            patient_id: Patient UUID string.

        Returns:
            List of dicts: icd10_code, description, onset_date, severity, is_primary.
        """
        stmt = text(
            """
            SELECT
                icd10_code,
                description,
                onset_date,
                severity,
                is_primary,
                recorded_at
            FROM patient_conditions
            WHERE patient_id  = :patient_id
              AND resolution_date IS NULL
            ORDER BY onset_date DESC NULLS LAST
            """
        )
        with time_db_query("conditions", "get_active_conditions"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt, {"patient_id": patient_id}
                )
        rows = result.mappings().all()
        return [dict(row) for row in rows]

    # ── Active condition count ─────────────────────────────────────────────────
    async def count_active_conditions(self, patient_id: str) -> int:
        """
        Return the count of active conditions — used as the
        ``num_conditions`` feature in readmission risk scoring.
        """
        stmt = text(
            """
            SELECT COUNT(*)
            FROM patient_conditions
            WHERE patient_id = :patient_id
              AND resolution_date IS NULL
            """
        )
        with time_db_query("conditions", "count_active_conditions"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt, {"patient_id": patient_id}
                )
        row = result.scalar()
        return int(row) if row is not None else 0

    # ── Charlson score ─────────────────────────────────────────────────────────
    async def get_comorbidity_score(self, patient_id: str) -> float:
        """
        Compute the Charlson Comorbidity Index for a patient from their
        active ICD-10 conditions.

        Used as the ``comorbidity_score`` feature for the readmission model.

        Returns:
            Float Charlson score (0.0 if no conditions found).
        """
        stmt = text(
            """
            SELECT icd10_code
            FROM patient_conditions
            WHERE patient_id = :patient_id
              AND resolution_date IS NULL
            """
        )
        with time_db_query("conditions", "get_comorbidity_score"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt, {"patient_id": patient_id}
                )
        codes = [row[0] for row in result.fetchall()]
        score = _compute_charlson(codes)
        logger.debug(
            "Charlson score computed",
            extra={"patient_id": patient_id, "score": score, "num_codes": len(codes)},
        )
        return score

    # ── ICD-10 co-occurrence matrix ────────────────────────────────────────────
    async def get_icd10_cooccurrence(
        self,
        icd10_codes: list[str],
        top_n: int = 20,
    ) -> list[dict[str, Any]]:
        """
        Find the most frequent ICD-10 codes that co-occur with the given codes
        across all tenant patients.

        Used for the ``diagnose-risk`` endpoint to build an interaction risk matrix.

        Args:
            icd10_codes: List of ICD-10 codes to find co-occurrences for.
            top_n:       Number of top co-occurring conditions to return.

        Returns:
            List of dicts: icd10_code, description, co_occurrence_count, frequency.
        """
        if not icd10_codes:
            return []

        stmt = text(
            """
            WITH target_patients AS (
                SELECT DISTINCT patient_id
                FROM patient_conditions
                WHERE icd10_code = ANY(:codes)
                  AND resolution_date IS NULL
            ),
            cooccurring AS (
                SELECT
                    c.icd10_code,
                    MAX(c.description) AS description,
                    COUNT(DISTINCT c.patient_id) AS co_occurrence_count
                FROM patient_conditions c
                JOIN target_patients tp USING (patient_id)
                WHERE c.icd10_code <> ALL(:codes)
                  AND c.resolution_date IS NULL
                GROUP BY c.icd10_code
            ),
            totals AS (
                SELECT COUNT(DISTINCT patient_id) AS total_patients
                FROM target_patients
            )
            SELECT
                co.icd10_code,
                co.description,
                co.co_occurrence_count,
                ROUND(
                    (co.co_occurrence_count::NUMERIC / NULLIF(t.total_patients, 0)) * 100,
                    2
                ) AS frequency
            FROM cooccurring co, totals t
            ORDER BY co.co_occurrence_count DESC
            LIMIT :top_n
            """
        )
        with time_db_query("conditions", "get_icd10_cooccurrence"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt, {"codes": icd10_codes, "top_n": top_n}
                )
        rows = result.mappings().all()
        return [dict(row) for row in rows]

    # ── Conditions by ICD-10 prefix ────────────────────────────────────────────
    async def get_conditions_by_codes(
        self,
        patient_id: str,
        icd10_codes: list[str],
    ) -> list[dict[str, Any]]:
        """
        Return a patient's conditions filtered to a specific set of ICD-10 codes.

        Used in the diagnose-risk endpoint to validate submitted codes
        against the patient's actual clinical record.
        """
        if not icd10_codes:
            return []

        stmt = text(
            """
            SELECT
                icd10_code,
                description,
                onset_date,
                severity,
                is_primary
            FROM patient_conditions
            WHERE patient_id = :patient_id
              AND icd10_code = ANY(:codes)
            ORDER BY onset_date DESC NULLS LAST
            """
        )
        with time_db_query("conditions", "get_conditions_by_codes"):
            async with asyncio.timeout(settings.analytics_db_query_timeout):
                result = await self._session.execute(
                    stmt, {"patient_id": patient_id, "codes": icd10_codes}
                )
        rows = result.mappings().all()
        return [dict(row) for row in rows]
