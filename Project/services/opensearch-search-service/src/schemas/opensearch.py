"""
MedTrustX OpenSearch Search Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List

from pydantic import BaseModel, ConfigDict


# ── Indexes ──

class IndexCreate(BaseModel):
    index_name: str
    mappings: Dict[str, Any]


class IndexResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    index_name: str
    mappings: Dict[str, Any]
    created_at: datetime


# ── Documents ──

class DocumentCreate(BaseModel):
    index_name: str
    document: Dict[str, Any]


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    index_name: str
    document: Dict[str, Any]
    created_at: datetime


# ── Queries ──

class SearchQueryRequest(BaseModel):
    query: str
    index_name: str


class SearchQueryResponse(BaseModel):
    query: str
    result_count: int
    results: List[Dict[str, Any]]
