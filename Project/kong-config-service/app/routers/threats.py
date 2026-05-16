"""
Threats Management Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.db.session import get_db_session
from app.services.threat_intelligence import ThreatIntelligence
from app.models.threat import BlockIPRequest, ThreatReport

router = APIRouter(prefix="/api/gateway/threats", tags=["threats"])

@router.get("/", response_model=ThreatReport)
async def get_threats(session: AsyncSession = Depends(get_db_session)):
    ti = ThreatIntelligence(session)
    return await ti.build_threat_report()

@router.get("/live")
async def get_live_threats(session: AsyncSession = Depends(get_db_session)):
    ti = ThreatIntelligence(session)
    report = await ti.build_threat_report()
    return {
        "blocked_ips": report.get("recent_blocked_ips", []),
        "active_alerts": report.get("total_threats", 0)
    }

@router.post("/block")
async def block_ip(request: Request, payload: BlockIPRequest, session: AsyncSession = Depends(get_db_session)):
    roles = getattr(request.state, "roles", [])
    if "IT_Admin" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="IT_Admin or superadmin role required")
        
    ti = ThreatIntelligence(session)
    await ti._block_ip(payload.ip_address, payload.reason)
    await ti.threat_repo.log_threat("manual_block", payload.ip_address, payload.reason)
    return {"status": "success", "ip": payload.ip_address}

@router.post("/internal")
async def internal_threat_log(payload: Dict[str, Any], session: AsyncSession = Depends(get_db_session)):
    """Called by kong lua plugins"""
    ti = ThreatIntelligence(session)
    await ti.threat_repo.log_threat(
        payload.get("threat_type", "unknown"),
        payload.get("source_ip", "0.0.0.0")
    )
    return {"status": "success"}
