"""
Continuous Verification Engine.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.services.trust_scorer import TrustScorer
from app.db.repositories.auth_log_repo import AuthLogRepository
from app.models.verification import VerificationResult

tracer = trace.get_tracer(__name__)

class ContinuousVerifier:
    def __init__(self, session: AsyncSession, redis):
        self.session = session
        self.trust_scorer = TrustScorer(session, redis)
        self.auth_log_repo = AuthLogRepository(session)

    async def _get_session_data(self, session_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM sessions WHERE id = :id")
        res = await self.session.execute(stmt, {"id": str(session_id)})
        row = res.mappings().first()
        return dict(row) if row else None

    async def should_reverify(self, session_id: UUID, current_ip: str) -> bool:
        session_data = await self._get_session_data(session_id)
        if not session_data:
            return True

        updated_at = session_data.get("updated_at")
        if updated_at:
            delta = datetime.now(timezone.utc) - updated_at.replace(tzinfo=timezone.utc)
            if delta.total_seconds() > 900:
                return True

        if session_data.get("last_known_ip") != current_ip:
            return True
            
        user_id = str(session_data["user_id"])
        
        anomaly = await self.auth_log_repo.compute_anomaly_score(user_id)
        if anomaly > 0.5:
            return True
            
        failures = await self.auth_log_repo.get_failed_attempts_24h(user_id)
        if failures > 0:
            return True

        return False

    async def reverify(self, session_id: UUID, user_id: UUID, device_id: UUID, source_ip: str) -> VerificationResult:
        with tracer.start_as_current_span("zta.continuous.verify"):
            score_resp = await self.trust_scorer.compute(user_id, device_id, source_ip)
            trust_score = score_resp.combined_score
            
            action = "continue"
            if trust_score < 0.3:
                action = "revoke"
            elif trust_score <= 0.6:
                action = "step_up_mfa"

            if action == "continue":
                stmt = text("UPDATE sessions SET updated_at = NOW(), last_known_ip = :ip WHERE id = :id")
                await self.session.execute(stmt, {"ip": source_ip, "id": str(session_id)})
                await self.session.commit()

            return VerificationResult(
                next_check_in_seconds=900 if action == "continue" else 0,
                action=action,
                trust_score=trust_score
            )
