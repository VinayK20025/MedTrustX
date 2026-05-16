"""
Session management with RLS injection.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def set_tenant_context(session: AsyncSession, tenant_id: str) -> None:
    stmt = text("SELECT set_config('app.current_tenant', :tenant, false)")
    await session.execute(stmt, {"tenant": tenant_id})

@asynccontextmanager
async def get_tenant_session(base_session_maker, tenant_id: str) -> AsyncGenerator[AsyncSession, None]:
    async with base_session_maker() as session:
        await set_tenant_context(session, tenant_id)
        try:
            yield session
        finally:
            await session.execute(text("SELECT set_config('app.current_tenant', '', false)"))
