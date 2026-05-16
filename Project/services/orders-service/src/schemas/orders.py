"""
MedTrustX Orders Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

# ── Order Events ──
class OrderEventCreate(BaseModel):
    event_type: str
    description: Optional[str] = None

class OrderEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_id: uuid.UUID
    tenant_id: uuid.UUID
    event_type: str
    description: Optional[str]
    created_at: datetime

# ── Order Routes ──
class OrderRouteCreate(BaseModel):
    target_service: str
    status: Optional[str] = "routed"

class OrderRouteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_id: uuid.UUID
    tenant_id: uuid.UUID
    target_service: str
    status: str
    routed_at: datetime

# ── Order Items ──
class OrderItemCreate(BaseModel):
    item_type: str
    reference_id: Optional[uuid.UUID] = None
    status: Optional[str] = "pending"

class OrderItemUpdate(BaseModel):
    status: Optional[str] = None

class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_id: uuid.UUID
    tenant_id: uuid.UUID
    item_type: str
    reference_id: Optional[uuid.UUID]
    status: str
    created_at: datetime

# ── Order Dependencies ──
class OrderDependencyCreate(BaseModel):
    depends_on_order_id: uuid.UUID

class OrderDependencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_id: uuid.UUID
    depends_on_order_id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime

# ── Orders ──
class OrderCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    order_type: str
    status: Optional[str] = "pending"
    created_by: Optional[uuid.UUID] = None
    items: Optional[List[OrderItemCreate]] = None
    dependencies: Optional[List[uuid.UUID]] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None

class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID]
    tenant_id: uuid.UUID
    order_type: str
    status: str
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

class OrderDetail(OrderResponse):
    items: List[OrderItemResponse] = []
    routes: List[OrderRouteResponse] = []
    events: List[OrderEventResponse] = []

class OrderList(BaseModel):
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int
