"""
MedTrustX Knowledge Graph Engine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List
from pydantic import BaseModel, ConfigDict

class NodeCreate(BaseModel):
    entity_type: str
    properties: Dict[str, Any] = {}

class NodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    entity_type: str
    properties: Dict[str, Any]
    created_at: datetime

class EdgeCreate(BaseModel):
    source_node: uuid.UUID
    target_node: uuid.UUID
    relation_type: str
    properties: Dict[str, Any] = {}

class EdgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    source_node: uuid.UUID
    target_node: uuid.UUID
    relation_type: str
    properties: Dict[str, Any]
    created_at: datetime

class GraphQueryRequest(BaseModel):
    query: str

class GraphQueryResponse(BaseModel):
    query: str
    result_count: int
    data: List[Dict[str, Any]]
    executed_at: datetime

class InferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    node_id: uuid.UUID
    inferred_relations: Dict[str, Any]
    created_at: datetime
