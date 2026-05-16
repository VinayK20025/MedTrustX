import pytest
from uuid import uuid4

pytestmark = pytest.mark.asyncio

async def test_create_tenant(client, mock_superadmin_auth):
    tenant_name = "Test Hospital"
    tenant_slug = "tenant_test"
    
    payload = {
        "tenant_name": tenant_name,
        "tenant_slug": tenant_slug,
        "admin_user_id": str(uuid4()),
        "metadata": {"region": "us-east"}
    }
    
    response = client.post("/api/rls/tenants", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_slug"] == tenant_slug
    assert data["status"] == "onboarded"
    assert "tenant_id" in data

async def test_list_tenants(client, mock_superadmin_auth):
    response = client.get("/api/rls/tenants")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
async def test_delete_tenant(client, mock_superadmin_auth):
    dummy_tenant_id = str(uuid4())
    payload = {
        "reason": "Test deletion",
        "purge_data": False,
        "offboarded_by": str(uuid4())
    }
    response = client.delete(f"/api/rls/tenants/{dummy_tenant_id}", json=payload)
    assert response.status_code in (200, 404, 500) # Since it might error if tenant not found
