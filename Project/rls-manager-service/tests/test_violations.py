import pytest

pytestmark = pytest.mark.asyncio

async def test_get_violations(client, mock_superadmin_auth):
    response = client.get("/api/rls/violations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

async def test_get_violation_stats(client, mock_superadmin_auth):
    response = client.get("/api/rls/violations/stats")
    assert response.status_code == 200
    data = response.json()
    assert "violations_last_24h" in data
    assert "top_violating_users" in data
