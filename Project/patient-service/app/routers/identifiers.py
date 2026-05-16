"""
Patient Identifiers Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_clinical_session
from app.models.identifier import IdentifierCreateRequest, IdentifierResponse

router = APIRouter(prefix="/api/patients/{patient_id}/identifiers", tags=["identifiers"])

@router.post("", response_model=IdentifierResponse)
async def add_identifier(
    patient_id: str,
    request: Request,
    payload: IdentifierCreateRequest,
    session: AsyncSession = Depends(get_clinical_session)
):
    raise HTTPException(status_code=501, detail="Not implemented in prototype phase")
