"""
Patient GraphQL Types.
"""
import strawberry
from typing import List, Optional

@strawberry.type
class VitalSign:
    type: str
    value: float
    unit: str
    timestamp: str

@strawberry.type
class Condition:
    code: str
    name: str
    status: str

@strawberry.type
class Medication:
    name: str
    dosage: str
    status: str

@strawberry.type
class PatientProfile:
    id: str
    tenant_id: str
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str

@strawberry.type
class PatientDashboardData:
    patient: PatientProfile
    vitals: List[VitalSign]
    conditions: List[Condition]
    medications: List[Medication]
    readmission_risk: Optional[str]
