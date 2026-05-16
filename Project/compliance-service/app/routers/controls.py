"""
Controls Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_operational_session
from app.services.control_mapper import ControlMapper, FRAMEWORKS
from app.models.control import FrameworkControl

router = APIRouter(prefix="/api/compliance/controls", tags=["controls"])

@router.get("/{framework}", response_model=List[FrameworkControl])
async def list_framework_controls(
    request: Request,
    framework: str,
    session: AsyncSession = Depends(get_operational_session)
):
    roles = getattr(request.state, "roles", [])
    if "compliance_officer" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Forbidden")

    if framework not in FRAMEWORKS:
        raise HTTPException(status_code=404, detail="Framework not found")
        
    mapper = ControlMapper(session)
    return await mapper.get_framework_controls(framework)
