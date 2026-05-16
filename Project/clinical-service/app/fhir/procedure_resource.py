"""
FHIR R4 Procedure Resource Mapper.
"""
from typing import Dict, Any

def map_procedure_to_fhir(db_proc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "resourceType": "Procedure",
        "id": str(db_proc.get("id")),
        "status": db_proc.get("status", "completed"),
        "subject": {
            "reference": f"Patient/{db_proc.get('patient_id')}"
        },
        "code": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": db_proc.get("procedure_code"),
                    "display": db_proc.get("description")
                }
            ]
        },
        "performedDateTime": str(db_proc.get("performed_at"))
    }
