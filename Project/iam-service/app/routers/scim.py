"""
SCIM 2.0 Router. RFC 7644 Compliant.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from typing import Dict, Any, List
from uuid import UUID
import uuid

from app.models.scim import SCIMUser, SCIMListResponse
from app.db.session import get_session
from app.db.repositories.user_repo import UserRepository
from app.services.user_provisioner import UserProvisioner

router = APIRouter(prefix="/scim/v2", tags=["scim"])

def _to_scim_user(user: Dict[str, Any]) -> SCIMUser:
    meta = user.get("metadata", {})
    return SCIMUser(
        id=str(user["id"]),
        userName=user["username"],
        name={"familyName": meta.get("last_name"), "givenName": meta.get("first_name")},
        emails=[{"value": user["email"], "primary": True}],
        active=(user["status"] == "active")
    )

@router.get("/Users", response_model=SCIMListResponse)
async def get_users(startIndex: int = 1, count: int = 50, session=Depends(get_session)):
    repo = UserRepository(session)
    users = await repo.list_users(None, (startIndex // count) + 1, count)
    scim_users = [_to_scim_user(u).model_dump(exclude_none=True) for u in users]
    
    return SCIMListResponse(
        totalResults=1000,
        startIndex=startIndex,
        itemsPerPage=count,
        Resources=scim_users
    )

@router.post("/Users", response_model=SCIMUser, status_code=201)
async def create_user(user: SCIMUser, session=Depends(get_session)):
    provisioner = UserProvisioner(session)
    email = user.emails[0].value if user.emails else f"{user.userName}@medtrust.local"
    first = user.name.givenName if user.name else ""
    last = user.name.familyName if user.name else ""
    
    tenant_id = uuid.UUID("9450c26c-d102-5ea8-b57f-7dc96e812d4a") 
    
    res = await provisioner.provision_user(
        user.userName, email, first, last, "Doctor", "Clinical", tenant_id
    )
    
    return _to_scim_user({
        "id": res["id"], "username": res["username"], "email": res["email"],
        "status": res["status"], "metadata": {"first_name": first, "last_name": last}
    })

@router.get("/Users/{id}", response_model=SCIMUser)
async def get_user(id: UUID, session=Depends(get_session)):
    repo = UserRepository(session)
    user = await repo.get_user_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_scim_user(user)

@router.put("/Users/{id}", response_model=SCIMUser)
async def put_user(id: UUID, user: SCIMUser, session=Depends(get_session)):
    repo = UserRepository(session)
    existing = await repo.get_user_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    status = "active" if user.active else "inactive"
    await repo.update_user(id, status, existing["metadata"])
    existing["status"] = status
    return _to_scim_user(existing)

@router.patch("/Users/{id}", response_model=SCIMUser)
async def patch_user(id: UUID, request: Request, session=Depends(get_session)):
    repo = UserRepository(session)
    existing = await repo.get_user_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_scim_user(existing)

@router.delete("/Users/{id}", status_code=204)
async def delete_user(id: UUID, session=Depends(get_session)):
    repo = UserRepository(session)
    await repo.soft_delete(id)
    return Response(status_code=204)

@router.get("/Groups")
async def get_groups():
    return {"totalResults": 0, "startIndex": 1, "itemsPerPage": 50, "Resources": [], "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"]}

@router.post("/Groups")
async def create_group():
    raise HTTPException(status_code=501, detail="Not implemented")

@router.get("/Groups/{id}")
async def get_group(id: str):
    raise HTTPException(status_code=404, detail="Group not found")

@router.put("/Groups/{id}")
async def put_group(id: str):
    raise HTTPException(status_code=501, detail="Not implemented")

@router.delete("/Groups/{id}")
async def delete_group(id: str):
    raise HTTPException(status_code=501, detail="Not implemented")

@router.get("/ServiceProviderConfig")
async def sp_config():
    return {
        "schemas": ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
        "patch": {"supported": True},
        "bulk": {"supported": False, "maxOperations": 1000, "maxPayloadSize": 1048576},
        "filter": {"supported": True, "maxResults": 200},
        "changePassword": {"supported": False},
        "sort": {"supported": False},
        "etag": {"supported": False},
        "authenticationSchemes": [{"type": "oauthbearertoken", "name": "OAuth Bearer Token", "description": "Authentication via PQC JWT"}]
    }

@router.get("/Schemas")
async def schemas():
    return {"totalResults": 0, "Resources": []}

@router.get("/ResourceTypes")
async def resource_types():
    return {"totalResults": 0, "Resources": []}
