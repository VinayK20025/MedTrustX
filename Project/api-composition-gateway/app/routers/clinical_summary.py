"""
Clinical Summary Composed Router.
"""
from fastapi import APIRouter, Request
from app.services.request_composer import RequestComposer
from app.services.response_merger import ResponseMerger

router = APIRouter(prefix="/api/composed", tags=["summary"])

@router.get("/clinical-summary/{patient_id}")
async def get_clinical_summary(request: Request, patient_id: str):
    headers = {"Authorization": f"Bearer {getattr(request.state, 'token', '')}"}
    composer = RequestComposer(headers=headers)
    
    spec = [
        {"key": "vitals", "service": "clinical-service", "path": f"/api/clinical/vitals/{patient_id}"},
        {"key": "conditions", "service": "clinical-service", "path": f"/api/clinical/conditions?patient_id={patient_id}"},
        {"key": "orders", "service": "clinical-service", "path": f"/api/clinical/{patient_id}/orders"},
        {"key": "results", "service": "clinical-service", "path": f"/api/clinical/{patient_id}/results"},
        {"key": "ai_insights", "service": "ai-platform-service", "path": f"/api/ai/vitals-anomaly?patient_id={patient_id}"},
        {"key": "recent_access", "service": "audit-service", "path": f"/api/audit?resource_id={patient_id}&limit=5"}
    ]
    
    results = await composer.compose(spec)
    return ResponseMerger.merge_clinical_summary(results, spec)
