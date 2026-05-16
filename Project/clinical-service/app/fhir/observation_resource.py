"""
FHIR R4 Observation Resource Mapper.
"""
from typing import Dict, Any

def map_vital_to_fhir(db_vital: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "resourceType": "Observation",
        "id": str(db_vital["id"]),
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "vital-signs",
                        "display": "Vital Signs"
                    }
                ]
            }
        ],
        "code": {
            "text": db_vital.get("vital_type")
        },
        "subject": {
            "reference": f"Patient/{db_vital.get('patient_id')}"
        },
        "effectiveDateTime": str(db_vital.get("recorded_at")),
        "valueQuantity": {
            "value": db_vital.get("value"),
            "unit": db_vital.get("unit")
        }
    }
