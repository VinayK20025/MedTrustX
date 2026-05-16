"""
MedTrustX Legal Case Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class CaseCreate(BaseModel):
    case_number: str
    type: str

class CaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_number: str
    type: str
    status: str
    created_at: datetime

class DocumentCreate(BaseModel):
    document_type: str
    file_path: str

class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    document_type: str
    file_path: str
    created_at: datetime

class TaskCreate(BaseModel):
    task_name: str
    assigned_to: uuid.UUID

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    task_name: str
    status: str
    assigned_to: uuid.UUID
    created_at: datetime

class ComplianceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    regulation: str
    status: str
    created_at: datetime
