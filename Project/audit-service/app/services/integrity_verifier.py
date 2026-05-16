"""
Integrity Verifier Service.
"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from datetime import datetime, timezone

from app.db.repositories.audit_repo import AuditEventRepository
from app.services.hash_chainer import compute_hash

tracer = trace.get_tracer(__name__)

class IntegrityVerifier:
    def __init__(self, session: AsyncSession):
        self.repo = AuditEventRepository(session)

    async def verify_chain(self, tenant_id: str, start_seq: int, end_seq: int) -> Dict[str, Any]:
        with tracer.start_as_current_span("audit.chain.verify"):
            events = await self.repo.get_events_range(start_seq, end_seq)
            
            verified_count = 0
            tampered_count = 0
            first_tampered_seq = None
            
            prev_hash = None
            
            for ev in events:
                expected_hash = compute_hash(ev)
                
                is_tampered = False
                if expected_hash != ev["current_hash"]:
                    is_tampered = True
                
                if prev_hash is not None and ev["previous_hash"] != prev_hash:
                    is_tampered = True
                    
                if is_tampered:
                    tampered_count += 1
                    if first_tampered_seq is None:
                        first_tampered_seq = ev["chain_sequence"]
                else:
                    verified_count += 1
                    
                prev_hash = ev["current_hash"]
                
            return {
                "tenant_id": tenant_id,
                "verified_count": verified_count,
                "tampered_count": tampered_count,
                "first_tampered_sequence": first_tampered_seq,
                "chain_intact": tampered_count == 0,
                "verification_timestamp": datetime.now(timezone.utc)
            }
