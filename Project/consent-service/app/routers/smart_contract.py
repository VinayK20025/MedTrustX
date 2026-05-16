"""
Smart Contract Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.db.session import get_operational_session
from app.db.repositories.smart_contract_repo import SmartContractRepository

router = APIRouter(prefix="/api/consent/contract", tags=["contract"])

@router.post("/register")
async def register_contract(
    request: Request,
    patient_id: str,
    contract_address: str,
    public_key: str,
    session: AsyncSession = Depends(get_operational_session)
):
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")

    tenant_id = getattr(request.state, "tenant_id", "default")
    repo = SmartContractRepository(session)
    await repo.register_contract(patient_id, tenant_id, contract_address, public_key)
    return {"status": "registered"}

@router.get("/{patient_id}")
async def get_contract(
    patient_id: str,
    request: Request,
    session: AsyncSession = Depends(get_operational_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    repo = SmartContractRepository(session)
    contract = await repo.get_patient_contract(patient_id, tenant_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract
