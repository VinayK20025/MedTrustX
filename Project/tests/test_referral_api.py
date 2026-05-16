import pytest
from httpx import AsyncClient
from clinical_service.app.main import app

@pytest.mark.asyncio
async def test_referral_health():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
