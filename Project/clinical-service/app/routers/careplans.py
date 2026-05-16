"""
Care Plans Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from datetime import datetime

from app.db.session import get_clinical_session
from app.db.repositories.careplan_repo import CarePlanRepository
from app.models.careplan import CarePlanCreateRequest, CarePlanRecord

router = APIRouter(prefix="/api/clinical/careplans", tags=["careplans"])

@router.post("", response_model=CarePlanRecord)
async def create_careplan(
    request: Request,
    payload: CarePlanCreateRequest,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    repo = CarePlanRepository(session)
    
    data = payload.model_dump()
    data["id"] = str(uuid.uuid4())
    data["tenant_id"] = tenant_id
    data["status"] = "active"
    data["created_at"] = datetime.utcnow()
    
    plan = await repo.create_careplan(tenant_id, data)
    return CarePlanRecord(**plan)

@router.get("/{patient_id}", response_model=List[CarePlanRecord])
async def list_careplans(
    patient_id: str,
    request: Request,
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    repo = CarePlanRepository(session)
    
    plans = await repo.get_patient_careplans(tenant_id, patient_id)
    return [CarePlanRecord(**p) for p in plans]
