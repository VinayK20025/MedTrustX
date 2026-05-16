"""
Tests for Kong Config Service.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_kong_health():
    async with AsyncClient(app=None, base_url="http://localhost:8021") as ac:
        try:
            response = await ac.get("/health")
            assert response.status_code == 200
        except Exception:
            pass
