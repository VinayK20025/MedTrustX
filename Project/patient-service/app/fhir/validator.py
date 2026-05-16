"""
FHIR R4 Validation.
"""
from typing import Dict, Any
from fhir.resources.patient import Patient
from fhir.resources.operationoutcome import OperationOutcome
from pydantic import ValidationError

def validate_patient(resource: Dict[str, Any]) -> Dict[str, Any]:
    try:
        Patient.parse_obj(resource)
        return {"is_valid": True}
    except ValidationError as e:
        outcome = OperationOutcome.construct(
            issue=[{
                "severity": "error",
                "code": "invalid",
                "diagnostics": str(e)
            }]
        )
        return {
            "is_valid": False,
            "outcome": outcome.dict()
        }
