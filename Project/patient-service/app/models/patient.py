"""
Patient Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import date, datetime
from uuid import UUID

class PatientCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None

class PatientUpdateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    insurance_info: Optional[Dict[str, Any]] = None

class PatientResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    tenant_id: str
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    blood_group: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[Dict[str, Any]]
    emergency_contact: Optional[Dict[str, Any]]
    insurance_info: Optional[Dict[str, Any]]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

class ClinicalRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    patient: PatientResponse
    vitals: List[Dict[str, Any]]
    conditions: List[Dict[str, Any]]
    medications: List[Dict[str, Any]]
    allergies: List[Dict[str, Any]]
    procedures: List[Dict[str, Any]]
    careplans: List[Dict[str, Any]]
    encounters: List[Dict[str, Any]]
