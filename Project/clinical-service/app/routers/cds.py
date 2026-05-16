"""
CDS Hooks Router.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List

from app.db.session import get_clinical_session
from app.services.cds_engine import CDSEngine

router = APIRouter(prefix="/cds-services", tags=["cds-hooks"])

@router.get("")
async def discover_cds_services():
    return {
        "services": [
            {
                "hook": "medication-prescribe",
                "id": "medication-prescribe-cds",
                "title": "MedTrustX Prescription Checks",
                "description": "Performs DDI, Allergy, and Dosage validation.",
                "prefetch": {
                    "medications": "MedicationRequest?patient={{context.patientId}}"
                }
            },
            {
                "hook": "patient-view",
                "id": "patient-view-cds",
                "title": "MedTrustX Patient Alerts",
                "description": "Shows readmission risk and missing screenings.",
                "prefetch": {}
            }
        ]
    }

@router.post("/medication-prescribe")
async def medication_prescribe_hook(
    request: Request,
    payload: Dict[str, Any],
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    context = payload.get("context", {})
    patient_id = context.get("patientId")
    meds_to_prescribe = context.get("medications", [])
    
    if not patient_id or not meds_to_prescribe:
        return {"cards": []}
        
    engine = CDSEngine(session)
    cards = []
    
    for med in meds_to_prescribe:
        med_code = med.get("medicationCodeableConcept", {}).get("coding", [{}])[0].get("code", "")
        alerts = await engine.check_prescription(tenant_id, patient_id, med_code, 100.0, [])
        for alert in alerts:
            indicator = "warning"
            if alert["severity"] == "CONTRAINDICATED" or alert["severity"] == "MAJOR":
                indicator = "critical"
                
            cards.append({
                "summary": alert.get("description", "Alert"),
                "indicator": indicator,
                "source": {
                    "label": "MedTrustX CDS Engine"
                },
                "detail": alert.get("recommendation", "")
            })
            
    return {"cards": cards}
