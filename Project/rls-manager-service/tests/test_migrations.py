import pytest

pytestmark = pytest.mark.asyncio

async def test_migrations_dry_run(client, mock_superadmin_auth):
    payload = {
        "migration_id": "head",
        "database": "clinical",
        "dry_run": True
    }
    response = client.post("/api/rls/migrations/run", json=payload)
    assert response.status_code == 200
    content = b"".join(response.iter_bytes()).decode()
    assert "COMPLETED" in content or "data:" in content

async def test_migrations_status(client, mock_superadmin_auth):
    response = client.get("/api/rls/migrations/status")
    assert response.status_code == 200
    data = response.json()
    assert "databases" in data
    assert "clinical" in data["databases"]
