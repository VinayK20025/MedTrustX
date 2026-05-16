"""
MedTrustX Keycloak Shim Service — Admin Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.keycloak import UserCreate, UserResponse
from src.services import keycloak_service

router = APIRouter(tags=["Admin"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/admin/realms/{realm}/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a User",
)
async def create_user(
    realm: str,
    data: UserCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = uuid.uuid5(uuid.NAMESPACE_DNS, realm)
    user = await keycloak_service.create_user(session, tenant_id, data)
    await session.commit()
    return user
