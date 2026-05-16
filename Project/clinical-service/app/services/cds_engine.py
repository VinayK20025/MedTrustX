"""
Clinical Decision Support Engine Coordinator.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from cds.drug_interactions import DrugInteractionChecker
from cds.allergy_checker import AllergyChecker
from cds.dosage_validator import DosageValidator

tracer = trace.get_tracer(__name__)

class CDSEngine:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _get_patient_weight_and_age(self, tenant_id: str, patient_id: str) -> Dict[str, Any]:
        return {"weight_kg": 70.0, "age_years": 45}
        
    async def _get_patient_allergies(self, tenant_id: str, patient_id: str) -> List[Dict[str, Any]]:
        return [{"allergen": "penicillin", "severity": "severe"}]

    async def check_prescription(self, tenant_id: str, patient_id: str, medication_code: str, dose_mg: float, active_medications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        with tracer.start_as_current_span("cds.check_prescription"):
            alerts = []
            
            int_alerts = DrugInteractionChecker.check(medication_code, active_medications)
            for alert in int_alerts:
                alerts.append({"type": "interaction", **alert})
                
            allergies = await self._get_patient_allergies(tenant_id, patient_id)
            alg_alerts = AllergyChecker.check(medication_code, allergies)
            for alert in alg_alerts:
                alerts.append({"type": "allergy", **alert})
                
            patient_info = await self._get_patient_weight_and_age(tenant_id, patient_id)
            dose_res = DosageValidator.validate(
                medication_code, dose_mg, 
                patient_info["weight_kg"], 
                patient_info["age_years"]
            )
            for alert in dose_res["alerts"]:
                alerts.append({"type": "dosage", **alert})
                
            return alerts
