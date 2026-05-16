"""
FHIR R4 Patient Resource Mapper.
"""
from typing import Dict, Any

def map_patient_to_fhir(db_patient: Dict[str, Any]) -> Dict[str, Any]:
    fhir = {
        "resourceType": "Patient",
        "id": str(db_patient["id"]),
        "identifier": [
            {
                "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                            "code": "MR",
                            "display": "Medical Record Number"
                        }
                    ]
                },
                "value": db_patient.get("mrn")
            }
        ],
        "active": db_patient.get("status", "active") == "active",
        "name": [
            {
                "use": "official",
                "family": db_patient.get("last_name"),
                "given": [db_patient.get("first_name")]
            }
        ],
        "gender": db_patient.get("gender"),
        "birthDate": str(db_patient.get("date_of_birth")),
        "telecom": []
    }
    
    if db_patient.get("phone"):
        fhir["telecom"].append({
            "system": "phone",
            "value": db_patient.get("phone"),
            "use": "mobile"
        })
        
    if db_patient.get("email"):
        fhir["telecom"].append({
            "system": "email",
            "value": db_patient.get("email")
        })
        
    addr = db_patient.get("address")
    if addr and isinstance(addr, dict):
        fhir["address"] = [{
            "use": "home",
            "line": [addr.get("street", "")],
            "city": addr.get("city", ""),
            "state": addr.get("state", ""),
            "postalCode": addr.get("zip", ""),
            "country": addr.get("country", "")
        }]
        
    bg = db_patient.get("blood_group")
    if bg:
        fhir["extension"] = [{
            "url": "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
            "valueString": bg
        }]
        
    ec = db_patient.get("emergency_contact")
    if ec and isinstance(ec, dict):
        fhir["contact"] = [{
            "relationship": [{"text": ec.get("relationship", "Emergency Contact")}],
            "name": {"text": ec.get("name", "")},
            "telecom": [{"system": "phone", "value": ec.get("phone", "")}]
        }]
        
    return fhir
