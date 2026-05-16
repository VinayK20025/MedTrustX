"""
FHIR R4 Condition Resource Mapper.
"""
from typing import Dict, Any

def map_condition_to_fhir(db_condition: Dict[str, Any]) -> Dict[str, Any]:
    fhir = {
        "resourceType": "Condition",
        "id": str(db_condition["id"]),
        "clinicalStatus": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    "code": db_condition.get("status", "active")
                }
            ]
        },
        "subject": {
            "reference": f"Patient/{db_condition.get('patient_id')}"
        },
        "onsetDateTime": str(db_condition.get("onset_date"))
    }
    
    codes = []
    if db_condition.get("icd10_code"):
        codes.append({
            "system": "http://hl7.org/fhir/sid/icd-10",
            "code": db_condition.get("icd10_code")
        })
    if db_condition.get("snomed_code"):
        codes.append({
            "system": "http://snomed.info/sct",
            "code": db_condition.get("snomed_code")
        })
        
    if codes:
        fhir["code"] = {
            "coding": codes,
            "text": db_condition.get("description")
        }
    else:
        fhir["code"] = {
            "text": db_condition.get("description")
        }
        
    return fhir
