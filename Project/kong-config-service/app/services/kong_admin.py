"""
Kong Admin API Client.
"""
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

class KongAdminClient:
    def __init__(self):
        self.base_url = settings.kong_admin_url

    async def get_services(self) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/services")
            res.raise_for_status()
            return res.json().get("data", [])

    async def create_service(self, config: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/services", json=config)
            res.raise_for_status()
            return res.json()

    async def update_service(self, service_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.patch(f"{self.base_url}/services/{service_id}", json=config)
            res.raise_for_status()
            return res.json()

    async def delete_service(self, service_id: str) -> None:
        async with httpx.AsyncClient() as client:
            res = await client.delete(f"{self.base_url}/services/{service_id}")
            res.raise_for_status()

    async def get_routes(self, service_id: Optional[str] = None) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/routes"
        if service_id:
            url = f"{self.base_url}/services/{service_id}/routes"
        async with httpx.AsyncClient() as client:
            res = await client.get(url)
            res.raise_for_status()
            return res.json().get("data", [])

    async def create_route(self, service_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/services/{service_id}/routes", json=config)
            res.raise_for_status()
            return res.json()

    async def delete_route(self, route_id: str) -> None:
        async with httpx.AsyncClient() as client:
            res = await client.delete(f"{self.base_url}/routes/{route_id}")
            res.raise_for_status()

    async def get_plugins(self) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{self.base_url}/plugins")
            res.raise_for_status()
            return res.json().get("data", [])

    async def enable_plugin(self, name: str, config: Dict[str, Any], route_id: Optional[str] = None, service_id: Optional[str] = None) -> Dict[str, Any]:
        payload = {"name": name, "config": config}
        if route_id:
            payload["route"] = {"id": route_id}
        if service_id:
            payload["service"] = {"id": service_id}
            
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{self.base_url}/plugins", json=payload)
            res.raise_for_status()
            return res.json()

    async def disable_plugin(self, plugin_id: str) -> None:
        async with httpx.AsyncClient() as client:
            res = await client.delete(f"{self.base_url}/plugins/{plugin_id}")
            res.raise_for_status()

    async def apply_deck_config(self, kong_yml_path: str, dry_run: bool = False) -> Dict[str, Any]:
        import subprocess
        cmd = ["deck", "sync", "-s", kong_yml_path, "--kong-addr", self.base_url]
        if dry_run:
            cmd = ["deck", "diff", "-s", kong_yml_path, "--kong-addr", self.base_url]
            
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"deck command failed: {result.stderr}")
            
        return {"status": "success", "output": result.stdout}
