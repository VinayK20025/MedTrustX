"""
Device routers.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from uuid import UUID
import uuid

from app.models.device import DeviceRegistrationRequest, DeviceRegistrationResponse, DeviceAttestationRequest, AttestationResult
from app.db.session import get_session
from app.db.repositories.device_repo import DeviceRepository
from app.services.device_attestor import DeviceAttestor
from app.dependencies import get_redis

router = APIRouter(prefix="/api/zta/device", tags=["device"])

def _check_admin(request: Request):
    roles = getattr(request.state, "roles", [])
    if "IT_Admin" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Role required: IT_Admin or superadmin")

@router.post("/register", response_model=DeviceRegistrationResponse)
async def register_device(request_body: DeviceRegistrationRequest, request: Request, session=Depends(get_session)):
    _check_admin(request)
    repo = DeviceRepository(session)
    
    existing = await repo.get_device_by_mac(request_body.mac_address)
    if existing:
        raise HTTPException(status_code=400, detail="Device already registered")
        
    device_id = uuid.uuid4()
    await repo.register_device(
        device_id, request_body.mac_address, request_body.device_name,
        request_body.os, request_body.os_version, request_body.patch_level,
        request_body.owner_user_id, request_body.tenant_id
    )
    
    return DeviceRegistrationResponse(
        device_id=device_id,
        trust_score=1.0
    )

@router.post("/attest", response_model=AttestationResult)
async def attest_device(request_body: DeviceAttestationRequest, session=Depends(get_session), redis=Depends(get_redis)):
    attestor = DeviceAttestor(session, redis)
    result = await attestor.attest(request_body.device_id, request_body.mac_address, request_body.compliance_evidence)
    return AttestationResult(
        trust_score=result["trust_score"],
        status=result["status"]
    )
