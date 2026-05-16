"""
Tenant registry database model.
"""
from datetime import datetime
from uuid import UUID

from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class TenantRegistryRecord(Base):
    __tablename__ = 'tenant_registry'

    id = Column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    tenant_id = Column(PGUUID(as_uuid=True), unique=True, nullable=False)
    tenant_name = Column(String(128), nullable=False)
    tenant_slug = Column(String(64), unique=True, nullable=False)
    status = Column(String(32), server_default='active')
    onboarded_at = Column(DateTime(timezone=True), server_default=func.now())
    offboarded_at = Column(DateTime(timezone=True), nullable=True)
    metadata = Column(JSONB, server_default='{}')
