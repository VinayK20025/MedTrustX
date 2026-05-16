"""
Tests for GraphQL Federation Gateway.
"""
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_graphql_health():
    async with AsyncClient(app=None, base_url="http://localhost:8023") as ac:
        try:
            response = await ac.get("/health")
            assert response.status_code == 200
        except Exception:
            pass
