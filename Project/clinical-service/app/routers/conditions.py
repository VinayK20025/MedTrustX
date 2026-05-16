"""
Conditions Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_clinical_session
from app.services.condition_manager import ConditionManager
from app.models.condition import ConditionCreateRequest, ConditionRecord

router = APIRouter(prefix="/api/clinical/conditions", tags=["conditions"])

@router.post("", response_model=ConditionRecord)
async def diagnose_condition(
    request: Request,
    payload: ConditionCreateRequest,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    user_id = getattr(request.state, "user_id", "system")
    
    manager = ConditionManager(session)
    try:
        condition = await manager.diagnose(tenant_id, payload.model_dump(), user_id)
        return ConditionRecord(**condition)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_id}", response_model=List[ConditionRecord])
async def list_conditions(
    patient_id: str,
    request: Request,
    status: str = "all",
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    manager = ConditionManager(session)
    
    conditions = await manager.list_conditions(tenant_id, patient_id, status)
    return [ConditionRecord(**c) for c in conditions]
