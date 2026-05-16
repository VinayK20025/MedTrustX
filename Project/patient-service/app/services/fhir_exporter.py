"""
FHIR R4 Patient Exporter.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.fhir.patient_resource import map_patient_to_fhir
from app.fhir.bundle import build_searchset_bundle, build_document_bundle
from app.db.repositories.patient_repo import PatientRepository

tracer = trace.get_tracer(__name__)

class FHIRExporter:
    def __init__(self, session: AsyncSession):
        self.repo = PatientRepository(session)

    async def export_patient(self, tenant_id: str, patient_id: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("fhir.export_patient"):
            patient = await self.repo.get_patient_by_id(tenant_id, patient_id)
            if not patient:
                return {}
            return map_patient_to_fhir(patient)

    async def export_patient_everything(self, tenant_id: str, patient_id: str, record_data: Dict[str, Any]) -> Dict[str, Any]:
        with tracer.start_as_current_span("fhir.export_everything"):
            patient = await self.repo.get_patient_by_id(tenant_id, patient_id)
            if not patient:
                return {}
            
            patient_fhir = map_patient_to_fhir(patient)
            
            other_resources = []
            
            for cond in record_data.get("conditions", []):
                other_resources.append({
                    "resourceType": "Condition",
                    "id": str(cond["id"]),
                    "subject": {"reference": f"Patient/{patient_id}"},
                    "code": {
                        "coding": [
                            {"system": "http://hl7.org/fhir/sid/icd-10", "code": cond.get("icd10_code")}
                        ],
                        "text": cond.get("description")
                    }
                })
                
            return build_document_bundle(patient_fhir, other_resources)
