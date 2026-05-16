"""
Patient Dashboard Composed Router.
"""
from fastapi import APIRouter, Request, Depends
import redis.asyncio as redis_async
import json

from app.services.request_composer import RequestComposer
from app.services.response_merger import ResponseMerger
from app.config import settings

router = APIRouter(prefix="/api/composed", tags=["dashboard"])

@router.get("/patient-dashboard/{patient_id}")
async def get_patient_dashboard(request: Request, patient_id: str):
    redis = redis_async.from_url(settings.redis_url)
    cache_key = f"medtrust:composed:dashboard:{patient_id}"
    
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
        
    headers = {"Authorization": f"Bearer {getattr(request.state, 'token', '')}"}
    
    composer = RequestComposer(headers=headers)
    spec = [
        {"key": "patient", "service": "patient-service", "path": f"/api/patients/{patient_id}"},
        {"key": "vitals", "service": "clinical-service", "path": f"/api/clinical/vitals/{patient_id}"},
        {"key": "conditions", "service": "clinical-service", "path": f"/api/clinical/conditions?patient_id={patient_id}"},
        {"key": "medications", "service": "clinical-service", "path": f"/api/clinical/medications?patient_id={patient_id}"},
        {"key": "appointments", "service": "appointment-service", "path": f"/api/appointments?patient_id={patient_id}"},
        {"key": "readmission_risk", "service": "ai-platform-service", "path": f"/api/ai/predict-readmission?patient_id={patient_id}"},
        {"key": "consent_summary", "service": "consent-service", "path": f"/api/consent/{patient_id}/summary"}
    ]
    
    results = await composer.compose(spec)
    data = ResponseMerger.merge_patient_dashboard(results, spec)
    
    await redis.setex(cache_key, 30, json.dumps(data))
    return data
