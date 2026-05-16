"""
Session Recording Repository.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
import json

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class RecordingRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def start_recording(self, session_id: UUID, user_id: UUID, jit_request_id: UUID) -> None:
        stmt = text("""
            INSERT INTO pam_session_recordings (
                id, session_id, user_id, jit_request_id, events, created_at, updated_at
            ) VALUES (
                gen_random_uuid(), :sid, :uid, :jit, '[]'::jsonb, NOW(), NOW()
            )
        """)
        await self.session.execute(stmt, {
            "sid": str(session_id),
            "uid": str(user_id),
            "jit": str(jit_request_id)
        })
        await self.session.commit()

    async def append_event(self, session_id: UUID, event: Dict[str, Any]) -> None:
        stmt = text("""
            UPDATE pam_session_recordings 
            SET events = events || :event::jsonb, updated_at = NOW() 
            WHERE session_id = :sid
        """)
        event_arr = json.dumps([event])
        await self.session.execute(stmt, {"sid": str(session_id), "event": event_arr})
        await self.session.commit()

    async def get_recording(self, session_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM pam_session_recordings WHERE session_id = :sid")
        result = await self.session.execute(stmt, {"sid": str(session_id)})
        row = result.mappings().first()
        return dict(row) if row else None
