"""
Device Repository.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime, timezone
import json

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class DeviceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_device(self, device_id: UUID, mac_address: str, device_name: str, 
                            os: str, os_version: str, patch_level: str, 
                            owner_user_id: UUID, tenant_id: UUID) -> None:
        stmt = text("""
            INSERT INTO devices (
                id, mac_address, name, os, os_version, patch_level, 
                owner_user_id, tenant_id, compliance_status, registered_at, last_seen_at
            ) VALUES (
                :id, :mac, :name, :os, :os_version, :patch_level,
                :owner, :tenant, 'compliant', NOW(), NOW()
            )
        """)
        await self.session.execute(stmt, {
            "id": str(device_id),
            "mac": mac_address,
            "name": device_name,
            "os": os,
            "os_version": os_version,
            "patch_level": patch_level,
            "owner": str(owner_user_id),
            "tenant": str(tenant_id)
        })
        await self.session.commit()

    async def get_device_by_id(self, device_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM devices WHERE id = :id")
        result = await self.session.execute(stmt, {"id": str(device_id)})
        row = result.mappings().first()
        if not row:
            return None
        return dict(row)

    async def get_device_by_mac(self, mac_address: str) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM devices WHERE mac_address = :mac")
        result = await self.session.execute(stmt, {"mac": mac_address})
        row = result.mappings().first()
        if not row:
            return None
        return dict(row)

    async def update_compliance(self, device_id: UUID, compliance_status: str, patch_level: str) -> None:
        stmt = text("""
            UPDATE devices 
            SET compliance_status = :status, patch_level = :patch, last_seen_at = NOW()
            WHERE id = :id
        """)
        await self.session.execute(stmt, {
            "status": compliance_status,
            "patch": patch_level,
            "id": str(device_id)
        })
        await self.session.commit()
