"""
Patient Resolvers.
"""
import json
from strawberry.types import Info
from app.services.composition_client import CompositionClient
from app.schema.patient.types import PatientDashboardData, PatientProfile, VitalSign, Condition, Medication

async def resolve_patient_dashboard(patient_id: str, info: Info) -> PatientDashboardData:
    user = info.context.get("user")
    if not user:
        raise Exception("Unauthorized")
        
    client = CompositionClient(user["token"])
    data = await client.get_patient_dashboard(patient_id)
    
    p = data.get("patient", {})
    patient_profile = PatientProfile(
        id=p.get("id", ""),
        tenant_id=p.get("tenant_id", ""),
        mrn=p.get("mrn", ""),
        first_name=p.get("first_name", ""),
        last_name=p.get("last_name", ""),
        date_of_birth=p.get("date_of_birth", ""),
        gender=p.get("gender", "")
    )
    
    vitals = [VitalSign(type=v["type"], value=v["value"], unit=v.get("unit",""), timestamp=v.get("timestamp","")) for v in data.get("vitals", [])]
    conditions = [Condition(code=c["code"], name=c["name"], status=c["status"]) for c in data.get("conditions", [])]
    meds = [Medication(name=m["name"], dosage=m.get("dosage",""), status=m.get("status","")) for m in data.get("medications", [])]
    
    risk = data.get("readmission_risk")
    risk_str = json.dumps(risk) if risk else None
    
    return PatientDashboardData(
        patient=patient_profile,
        vitals=vitals,
        conditions=conditions,
        medications=meds,
        readmission_risk=risk_str
    )
