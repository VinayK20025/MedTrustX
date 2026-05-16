"""
Integrity Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_clinical_session
from app.services.integrity_verifier import IntegrityVerifier
from app.models.hash_chain import IntegrityReport

router = APIRouter(prefix="/api/audit/integrity", tags=["integrity"])

@router.get("/verify", response_model=IntegrityReport)
async def verify_chain(
    request: Request,
    tenant_id: str,
    start_sequence: int,
    end_sequence: int,
    session: AsyncSession = Depends(get_clinical_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    verifier = IntegrityVerifier(session)
    report = await verifier.verify_chain(tenant_id, start_sequence, end_sequence)
    return IntegrityReport(**report)
