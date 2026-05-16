import pytest
from unittest.mock import AsyncMock, patch
from datetime import date
from app.models.patient import PatientCreateRequest
from app.services.patient_manager import PatientManager
from app.fhir.patient_resource import map_patient_to_fhir

@pytest.mark.asyncio
async def test_patient_creation():
    mock_session = AsyncMock()
    manager = PatientManager(mock_session)
    
    manager.repo.get_patient_by_mrn = AsyncMock(return_value=None)
    manager.repo.create_patient = AsyncMock(return_value={
        "id": "123",
        "tenant_id": "tenant-A",
        "mrn": "MRN123",
        "status": "active"
    })
    
    req = PatientCreateRequest(
        mrn="MRN123",
        first_name="John",
        last_name="Doe",
        date_of_birth=date(1990, 1, 1),
        gender="male",
        contact=[]
    )
    
    result = await manager.create_patient("tenant-A", req, "user1")
    assert result["mrn"] == "MRN123"

def test_fhir_mapping():
    db_patient = {
        "id": "123",
        "mrn": "MRN123",
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1990-01-01",
        "gender": "male",
        "identifiers": [],
        "contacts": [],
        "status": "active"
    }
    
    fhir = map_patient_to_fhir(db_patient)
    assert fhir["resourceType"] == "Patient"
    assert fhir["id"] == "123"
    assert fhir["name"][0]["family"] == "Doe"
