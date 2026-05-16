"""
Recording Routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from uuid import UUID

from app.models.recording import EventLogRequest, RecordingResponse
from app.db.session import get_session
from app.services.session_recorder import SessionRecorder

router = APIRouter(prefix="/api/pam/recording", tags=["recording"])

@router.post("/start")
async def start_recording(session_id: UUID, jit_request_id: UUID, request: Request, session=Depends(get_session)):
    recorder = SessionRecorder(session)
    user_id = UUID(request.state.user_id)
    
    await recorder.start_recording(session_id, user_id, jit_request_id)
    return {"status": "recording_started", "session_id": session_id}

@router.post("/events")
async def log_event(request_body: EventLogRequest, request: Request, session=Depends(get_session)):
    recorder = SessionRecorder(session)
    session_id = getattr(request.state, "session_id", None)
    if not session_id:
        raise HTTPException(status_code=400, detail="No session context available")
        
    await recorder.log_event(
        UUID(session_id), request_body.event_type, request_body.action, 
        request_body.target, request_body.metadata
    )
    return {"status": "event_logged"}

@router.get("/{session_id}", response_model=RecordingResponse)
async def get_recording(session_id: UUID, request: Request, session=Depends(get_session)):
    roles = getattr(request.state, "roles", [])
    if "IT_Admin" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Auditor role required")
        
    recorder = SessionRecorder(session)
    try:
        rec = await recorder.get_recording(session_id)
        return RecordingResponse(
            session_id=rec["session_id"],
            user_id=rec["user_id"],
            jit_request_id=rec["jit_request_id"],
            events=rec["events"],
            created_at=rec["created_at"]
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
