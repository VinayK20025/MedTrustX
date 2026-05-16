"""
MedTrustX Keycloak Shim Service — OIDC Endpoints
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status, Form
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.keycloak import TokenResponse, UserInfoResponse, LogoutRequest
from src.services import keycloak_service

router = APIRouter(tags=["OIDC"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/realms/{realm}/protocol/openid-connect/token",
    response_model=TokenResponse,
    summary="Get an OIDC Token",
)
async def get_token(
    realm: str,
    request: Request,
    grant_type: str = Form(...),
    client_id: str = Form(...),
    username: str = Form(None),
    password: str = Form(None),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = uuid.uuid5(uuid.NAMESPACE_DNS, realm)
    
    if grant_type == "password":
        if not username or not password:
            raise HTTPException(status_code=400, detail="Missing credentials")
            
        user = await keycloak_service.authenticate_user(session, tenant_id, username, password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        token_data = await keycloak_service.issue_token(session, tenant_id, user, client_id)
        await session.commit()
        return token_data
        
    raise HTTPException(status_code=400, detail="Unsupported grant_type")

@router.post(
    "/realms/{realm}/protocol/openid-connect/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout",
)
async def logout(
    realm: str,
    request: Request,
    client_id: str = Form(...),
    refresh_token: str = Form(...),
    session: AsyncSession = Depends(get_session),
):
    # Simplified logout logic
    return None

@router.get(
    "/realms/{realm}/protocol/openid-connect/userinfo",
    response_model=UserInfoResponse,
    summary="Get UserInfo",
)
async def userinfo(
    realm: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    # In a real impl, we extract token and find user. Returning dummy for now.
    return UserInfoResponse(
        sub=str(uuid.uuid4()),
        preferred_username="testuser",
        email="testuser@example.com"
    )

@router.get(
    "/realms/{realm}/protocol/openid-connect/certs",
    summary="Get JWKS Certs",
)
async def certs(realm: str):
    return {"keys": []}
