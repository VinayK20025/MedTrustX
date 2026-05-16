"""
MedTrustX Telemedicine Service — Sessions Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.telemedicine import (
    TeleSessionCreate, TeleSessionDetail, TeleSessionList, TeleSessionResponse, TeleSessionUpdate,
    ParticipantCreate, ParticipantResponse, TokenResponse, SessionEventResponse
)
from src.services import telemedicine_service

router = APIRouter(prefix="/telemedicine/sessions", tags=["Telemedicine Sessions"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=TeleSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new telemedicine session",
)
async def create_session(
    data: TeleSessionCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    tele_session = await telemedicine_service.create_session(session, tenant_id, data)
    await session.commit()
    return tele_session

@router.get(
    "/{session_id}",
    response_model=TeleSessionDetail,
    summary="Get session details",
)
async def get_session(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    tele_session = await telemedicine_service.get_session(session, tenant_id, session_id)
    if not tele_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return tele_session

@router.put(
    "/{session_id}",
    response_model=TeleSessionResponse,
    summary="Update a telemedicine session",
)
async def update_session(
    session_id: uuid.UUID,
    data: TeleSessionUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    tele_session = await telemedicine_service.update_session(session, tenant_id, session_id, data)
    if not tele_session:
        raise HTTPException(status_code=404, detail="Session not found")
    await session.commit()
    return tele_session

@router.post(
    "/{session_id}/participants",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a participant to the session",
)
async def add_participant(
    session_id: uuid.UUID,
    data: ParticipantCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        participant = await telemedicine_service.add_participant(session, tenant_id, session_id, data)
        await session.commit()
        return participant
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{session_id}/participants",
    response_model=List[ParticipantResponse],
    summary="List participants in a session",
)
async def get_participants(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await telemedicine_service.get_participants(session, tenant_id, session_id)

@router.post(
    "/{session_id}/join-token",
    response_model=TokenResponse,
    summary="Generate an ephemeral token to join the session",
)
async def generate_join_token(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        token = await telemedicine_service.generate_join_token(session, tenant_id, session_id)
        await session.commit()
        return token
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post(
    "/{session_id}/start",
    response_model=TeleSessionResponse,
    summary="Start the telemedicine session",
)
async def start_session(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    tele_session = await telemedicine_service.start_session(session, tenant_id, session_id)
    if not tele_session:
        raise HTTPException(status_code=404, detail="Session not found")
    await session.commit()
    return tele_session

@router.post(
    "/{session_id}/end",
    response_model=TeleSessionResponse,
    summary="End the telemedicine session",
)
async def end_session(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    tele_session = await telemedicine_service.end_session(session, tenant_id, session_id)
    if not tele_session:
        raise HTTPException(status_code=404, detail="Session not found")
    await session.commit()
    return tele_session

@router.get(
    "/{session_id}/events",
    response_model=List[SessionEventResponse],
    summary="Get events for a session",
)
async def get_session_events(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await telemedicine_service.get_session_events(session, tenant_id, session_id)
