"""
Admin Overview Composed Router.
"""
from fastapi import APIRouter, Request
from app.services.request_composer import RequestComposer
from app.services.response_merger import ResponseMerger

router = APIRouter(prefix="/api/composed", tags=["admin"])

@router.get("/admin-overview/{tenant_id}")
async def get_admin_overview(request: Request, tenant_id: str):
    headers = {"Authorization": f"Bearer {getattr(request.state, 'token', '')}"}
    composer = RequestComposer(headers=headers)
    
    spec = [
        {"key": "iam", "service": "iam-service", "path": f"/api/iam/stats?tenant_id={tenant_id}"},
        {"key": "zta", "service": "zta-service", "path": f"/api/zta/summary?tenant_id={tenant_id}"},
        {"key": "audit", "service": "audit-service", "path": f"/api/audit/stats?tenant_id={tenant_id}"},
        {"key": "compliance", "service": "compliance-service", "path": f"/api/compliance/scorecard?tenant_id={tenant_id}"},
        {"key": "ai", "service": "ai-platform-service", "path": f"/api/ai/analytics/utilization?tenant_id={tenant_id}"},
        {"key": "appointments", "service": "appointment-service", "path": f"/api/appointments/stats?tenant_id={tenant_id}"}
    ]
    
    results = await composer.compose(spec)
    return ResponseMerger.merge_admin_overview(results, spec)
