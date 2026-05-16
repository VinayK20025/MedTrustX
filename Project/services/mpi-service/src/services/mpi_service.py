"""
MedTrustX MPI Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.mpi import MasterPatient, PatientLink, MatchCandidate, MergeHistory, IdentityAttribute
from src.schemas.mpi import (
    MasterPatientCreate, PatientLinkCreate, MatchRequest, MergeRequest
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Registration ──

async def register_patient(
    session: AsyncSession, tenant_id: uuid.UUID, data: MasterPatientCreate
) -> MasterPatient:
    # Check if global identifier already exists
    result = await session.execute(
        select(MasterPatient).where(and_(MasterPatient.global_identifier == data.global_identifier, MasterPatient.tenant_id == tenant_id, MasterPatient.deleted_at.is_(None)))
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing
        
    mp = MasterPatient(
        tenant_id=tenant_id,
        global_identifier=data.global_identifier
    )
    session.add(mp)
    await session.flush()
    
    if data.attributes:
        for k, v in data.attributes.items():
            attr = IdentityAttribute(
                tenant_id=tenant_id,
                master_patient_id=mp.id,
                attribute_key=k,
                attribute_value=v
            )
            session.add(attr)
            
    await publish_event("PATIENT_REGISTERED", tenant_id, mp.id, {"global_identifier": data.global_identifier})
    return mp

async def get_master_patient(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> Optional[MasterPatient]:
    result = await session.execute(
        select(MasterPatient).where(and_(MasterPatient.id == patient_id, MasterPatient.tenant_id == tenant_id, MasterPatient.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Linking ──

async def link_patient(
    session: AsyncSession, tenant_id: uuid.UUID, data: PatientLinkCreate
) -> PatientLink:
    link = PatientLink(
        tenant_id=tenant_id,
        master_patient_id=data.master_patient_id,
        source_system=data.source_system,
        source_patient_id=data.source_patient_id
    )
    session.add(link)
    await session.flush()
    await publish_event("PATIENT_LINKED", tenant_id, data.master_patient_id, {"source_system": data.source_system, "source_patient_id": str(data.source_patient_id)})
    return link

async def get_patient_links(
    session: AsyncSession, tenant_id: uuid.UUID, master_patient_id: uuid.UUID
) -> List[PatientLink]:
    result = await session.execute(
        select(PatientLink).where(and_(PatientLink.master_patient_id == master_patient_id, PatientLink.tenant_id == tenant_id, PatientLink.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── Matching ──

async def create_match_candidate(
    session: AsyncSession, tenant_id: uuid.UUID, data: MatchRequest
) -> MatchCandidate:
    cand = MatchCandidate(
        tenant_id=tenant_id,
        patient_a=data.patient_a,
        patient_b=data.patient_b,
        match_score=data.match_score,
        status="pending"
    )
    session.add(cand)
    await session.flush()
    
    if data.match_score >= 90:
        await publish_event("DUPLICATE_DETECTED", tenant_id, cand.id, {"patient_a": str(data.patient_a), "patient_b": str(data.patient_b), "score": data.match_score})
        
    return cand

# ── Merging ──

async def merge_patients(
    session: AsyncSession, tenant_id: uuid.UUID, data: MergeRequest
) -> Optional[MergeHistory]:
    # Ensure both exist
    mp1 = await get_master_patient(session, tenant_id, data.master_patient_id)
    mp2 = await get_master_patient(session, tenant_id, data.merged_patient_id)
    
    if not mp1 or not mp2:
        return None
        
    hist = MergeHistory(
        tenant_id=tenant_id,
        master_patient_id=data.master_patient_id,
        merged_patient_id=data.merged_patient_id
    )
    session.add(hist)
    
    # Soft delete the merged patient
    mp2.soft_delete()
    
    # Update links
    result = await session.execute(
        select(PatientLink).where(and_(PatientLink.master_patient_id == data.merged_patient_id, PatientLink.tenant_id == tenant_id, PatientLink.deleted_at.is_(None)))
    )
    links = result.scalars().all()
    for link in links:
        link.master_patient_id = data.master_patient_id
        
    await session.flush()
    await publish_event("PATIENT_MERGED", tenant_id, data.master_patient_id, {"merged_patient_id": str(data.merged_patient_id)})
    return hist
