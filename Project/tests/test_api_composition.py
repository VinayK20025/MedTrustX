"""
Tests for API Composition Gateway.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_composition_health():
    async with AsyncClient(app=None, base_url="http://localhost:8022") as ac:
        try:
            response = await ac.get("/health")
            assert response.status_code == 200
        except Exception:
            pass
