"""
MedTrustX IAM Service — Auth Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.iam import TokenResponse
from src.services import iam_service
from src.models.iam import IdentityProvider, User, Role, UserRole
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Auth"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and issue JWT",
)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user = await iam_service.authenticate_user(session, tenant_id, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # [ZTA UEBA Integration] Check UEBA Risk Score — advisory, always fails open
    try:
        import httpx
        async with httpx.AsyncClient(timeout=1.5) as client:
            resp = await client.get("http://localhost:8000/api/v1/ueba/risk-scores")
            if resp.status_code == 200:
                scores = resp.json().get("items", [])
                user_score = next((s for s in scores if s.get("targetId") == form_data.username), None)
                if user_score and user_score.get("currentRiskScore", 0) >= 80:
                    raise HTTPException(
                        status_code=403,
                        detail=f"ZTA Action: Access Denied. High UEBA Risk Score ({user_score.get('currentRiskScore')}/100)"
                    )
    except HTTPException:
        raise  # Re-raise ZTA denial
    except Exception:
        pass  # UEBA unreachable — fail open, never block login
        
    token_response = await iam_service.create_user_session(session, tenant_id, user)
    await session.commit()
    return token_response

@router.post(
    "/sso/login",
    response_model=TokenResponse,
    summary="Login via External SSO Provider (Simulation)",
)
async def sso_login(
    request: Request,
    provider: str,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    
    # Verify the SSO provider is enabled for the tenant
    result = await session.execute(
        select(IdentityProvider).where(
            IdentityProvider.tenant_id == tenant_id,
            IdentityProvider.provider_name == provider
        )
    )
    idp = result.scalars().first()
    if not idp or not idp.config.get('enabled', False):
        raise HTTPException(status_code=400, detail=f"SSO Provider {provider} is not configured or enabled")

    # Simulate successful SSO by logging in as the tenant admin (CEO)
    result = await session.execute(
        select(User).where(
            User.tenant_id == tenant_id,
            User.username == "demo@chief-executive-officer.local.medtrustx"
        )
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="SSO simulation user not found")
        
    token_response = await iam_service.create_user_session(session, tenant_id, user)
    await session.commit()
    return token_response

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout and revoke session",
)
async def logout(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    token = auth_header.split(" ")[1]
    revoked = await iam_service.revoke_session(session, tenant_id, token)
    if not revoked:
        raise HTTPException(status_code=400, detail="Invalid or already revoked session")
        
    await session.commit()
    return {"status": "success", "message": "Logged out successfully"}

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh JWT token",
)
async def refresh(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    # Simplified for now. Normally validates existing refresh token and issues new access token
    raise HTTPException(status_code=501, detail="Not Implemented")
