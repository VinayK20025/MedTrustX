import pytest
import asyncio
from uuid import uuid4
from medtrust_rls.exceptions import BypassDenied
from medtrust_rls.bypass import PAMBypassManager
from redis.asyncio import Redis
from app.config import settings

pytestmark = pytest.mark.asyncio

@pytest_asyncio.fixture
async def redis_client():
    client = Redis.from_url(settings.redis_url)
    yield client
    await client.aclose()

async def test_bypass_requires_approval(redis_client):
    manager = PAMBypassManager(redis_client)
    user_id = uuid4()
    tenant_id = uuid4()
    
    is_active = await manager.is_bypass_active(user_id, tenant_id)
    assert not is_active

async def test_bypass_grants_cross_tenant_access(redis_client):
    manager = PAMBypassManager(redis_client)
    user_id = uuid4()
    tenant_id = uuid4()
    approver_id = uuid4()
    
    await manager.request_bypass(user_id, tenant_id, "emergency", 10, approver_id)
    is_active = await manager.is_bypass_active(user_id, tenant_id)
    assert is_active

async def test_bypass_expires_after_ttl(redis_client):
    manager = PAMBypassManager(redis_client)
    user_id = uuid4()
    tenant_id = uuid4()
    
    await redis_client.set(f"medtrust:pam:approved:{user_id}:{tenant_id}", "dummy", ex=1)
    
    is_active_before = await manager.is_bypass_active(user_id, tenant_id)
    assert is_active_before
    
    await asyncio.sleep(2)
    
    is_active_after = await manager.is_bypass_active(user_id, tenant_id)
    assert not is_active_after

async def test_bypass_revoke_immediate(redis_client):
    manager = PAMBypassManager(redis_client)
    user_id = uuid4()
    tenant_id = uuid4()
    approver_id = uuid4()
    
    await manager.request_bypass(user_id, tenant_id, "emergency", 10, approver_id)
    assert await manager.is_bypass_active(user_id, tenant_id)
    
    await manager.revoke_bypass(user_id, tenant_id)
    assert not await manager.is_bypass_active(user_id, tenant_id)
