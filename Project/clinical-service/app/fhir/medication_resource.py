"""
FHIR R4 MedicationRequest Resource Mapper.
"""
from typing import Dict, Any

def map_medication_to_fhir(db_med: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "resourceType": "MedicationRequest",
        "id": str(db_med["id"]),
        "status": db_med.get("status", "active"),
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [
                {
                    "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                    "code": db_med.get("medication_code"),
                    "display": db_med.get("medication_code")
                }
            ]
        },
        "subject": {
            "reference": f"Patient/{db_med.get('patient_id')}"
        },
        "authoredOn": str(db_med.get("prescribed_at")),
        "requester": {
            "reference": f"Practitioner/{db_med.get('prescriber_id')}"
        },
        "dosageInstruction": [
            {
                "text": f"{db_med.get('dose')} {db_med.get('frequency')} for {db_med.get('duration')}"
            }
        ]
    }
