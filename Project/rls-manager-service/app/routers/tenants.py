from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Any, Dict, List
from uuid import UUID
from datetime import datetime, timezone

from app.models.tenant import TenantCreate, TenantResponse, TenantDetail, TenantDeleteRequest
from app.services.tenant_provisioner import TenantProvisioner
from app.services.tenant_deprovisioner import TenantDeprovisioner
from app.services.rls_verifier import RLSVerifier
from app.dependencies import get_redis

router = APIRouter(prefix="/api/rls/tenants", tags=["tenants"])

def _check_superadmin(request: Request):
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Superadmin role required")

@router.post("", response_model=TenantResponse)
async def create_tenant(request_body: TenantCreate, request: Request, redis=Depends(get_redis)):
    _check_superadmin(request)
    provisioner = TenantProvisioner(redis)
    result = await provisioner.onboard(request_body.tenant_slug, request_body.tenant_name, request_body.metadata, str(request_body.admin_user_id))
    
    return {
        "tenant_id": result["tenant_id"],
        "tenant_name": request_body.tenant_name,
        "tenant_slug": request_body.tenant_slug,
        "status": "onboarded",
        "onboarded_at": datetime.now(timezone.utc).isoformat(),
        "metadata": request_body.metadata
    }

@router.get("")
async def list_tenants(request: Request):
    _check_superadmin(request)
    from app.db.sessions import get_raw_session
    from app.db.repositories.tenant_repo import TenantRepository
    session = await get_raw_session("clinical")
    try:
        repo = TenantRepository(session)
        records = await repo.list_all()
        return [
            {
                "tenant_id": r.tenant_id,
                "tenant_name": r.tenant_name,
                "tenant_slug": r.tenant_slug,
                "status": r.status,
                "onboarded_at": r.onboarded_at,
                "metadata": r.metadata,
                "patient_count": 0,
                "user_count": 0,
                "last_activity": None
            } for r in records
        ]
    finally:
        await session.close()

@router.get("/{tenant_id}")
async def get_tenant(tenant_id: UUID, request: Request):
    _check_superadmin(request)
    from app.db.sessions import get_raw_session
    from app.db.repositories.tenant_repo import TenantRepository
    session = await get_raw_session("clinical")
    try:
        repo = TenantRepository(session)
        record = await repo.get_by_id(tenant_id)
        if not record:
            raise HTTPException(status_code=404, detail="Tenant not found")
        return {
            "tenant_id": record.tenant_id,
            "tenant_name": record.tenant_name,
            "tenant_slug": record.tenant_slug,
            "status": record.status,
            "onboarded_at": record.onboarded_at,
            "metadata": record.metadata,
            "db_stats": {},
            "rls_status": {},
            "active_bypasses": []
        }
    finally:
        await session.close()

@router.delete("/{tenant_id}")
async def delete_tenant(tenant_id: UUID, request_body: TenantDeleteRequest, request: Request, redis=Depends(get_redis)):
    _check_superadmin(request)
    deprovisioner = TenantDeprovisioner(redis)
    result = await deprovisioner.offboard(tenant_id, request_body.purge_data, request_body.offboarded_by, request_body.reason)
    return result

@router.get("/{tenant_id}/verify")
async def verify_tenant(tenant_id: UUID, request: Request):
    _check_superadmin(request)
    verifier = RLSVerifier()
    return await verifier.run_full_proof(tenant_id)
