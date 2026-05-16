"""
Orders Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_clinical_session
from app.dependencies import get_redis
from app.services.order_workflow import OrderWorkflow
from app.models.order import OrderCreateRequest, OrderRecord

router = APIRouter(prefix="/api/clinical", tags=["orders"])

@router.post("/{patient_id}/orders", response_model=OrderRecord)
async def create_order(
    patient_id: str,
    request: Request,
    payload: OrderCreateRequest,
    session: AsyncSession = Depends(get_clinical_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    if payload.patient_id != patient_id:
        raise HTTPException(status_code=400, detail="Patient ID mismatch")
        
    workflow = OrderWorkflow(session, redis)
    order = await workflow.create_order(tenant_id, payload.model_dump())
    return OrderRecord(**order)

@router.get("/{patient_id}/orders", response_model=List[OrderRecord])
async def list_orders(
    patient_id: str,
    request: Request,
    order_type: Optional[str] = None,
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_clinical_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    workflow = OrderWorkflow(session, redis)
    
    orders = await workflow.list_orders(tenant_id, patient_id, order_type, status)
    return [OrderRecord(**o) for o in orders]
