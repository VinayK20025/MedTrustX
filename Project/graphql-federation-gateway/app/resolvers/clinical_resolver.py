"""
Clinical Resolvers.
"""
import json
from strawberry.types import Info
from app.services.composition_client import CompositionClient
from app.schema.clinical.types import ClinicalSummaryData, Order, Result
from app.schema.patient.types import VitalSign, Condition

async def resolve_clinical_summary(patient_id: str, info: Info) -> ClinicalSummaryData:
    user = info.context.get("user")
    if not user:
        raise Exception("Unauthorized")
        
    client = CompositionClient(user["token"])
    data = await client.get_clinical_summary(patient_id)
    
    vitals = [VitalSign(type=v["type"], value=v["value"], unit=v.get("unit",""), timestamp=v.get("timestamp","")) for v in data.get("vitals", [])]
    conditions = [Condition(code=c["code"], name=c["name"], status=c["status"]) for c in data.get("conditions", [])]
    orders = [Order(id=o["id"], type=o.get("type",""), status=o.get("status",""), date=o.get("date","")) for o in data.get("orders", [])]
    results = [Result(id=r["id"], test_name=r.get("test_name",""), value=r.get("value",""), date=r.get("date","")) for r in data.get("results", [])]
    
    insights = data.get("ai_insights")
    insights_str = json.dumps(insights) if insights else None
    
    return ClinicalSummaryData(
        vitals=vitals,
        conditions=conditions,
        orders=orders,
        results=results,
        ai_insights=insights_str
    )
