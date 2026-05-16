"""
Session Recorder Service.
"""
from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.db.repositories.recording_repo import RecordingRepository

tracer = trace.get_tracer(__name__)

class SessionRecorder:
    def __init__(self, session: AsyncSession):
        self.repo = RecordingRepository(session)

    async def start_recording(self, session_id: UUID, user_id: UUID, jit_request_id: UUID) -> None:
        with tracer.start_as_current_span("pam.recording.start"):
            await self.repo.start_recording(session_id, user_id, jit_request_id)

    async def log_event(self, session_id: UUID, event_type: str, action: str, 
                        target: str, metadata: Dict[str, Any] = None) -> None:
        with tracer.start_as_current_span("pam.recording.log"):
            event = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": event_type,
                "action": action,
                "target": target,
                "metadata": metadata or {}
            }
            await self.repo.append_event(session_id, event)

    async def get_recording(self, session_id: UUID) -> Dict[str, Any]:
        with tracer.start_as_current_span("pam.recording.get"):
            rec = await self.repo.get_recording(session_id)
            if not rec:
                raise ValueError("Recording not found")
            return rec
