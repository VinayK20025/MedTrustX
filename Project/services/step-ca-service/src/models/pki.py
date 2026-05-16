"""
MedTrustX Step-CA Shim Service — Domain Entities
"""
import uuid
from datetime import datetime

from sqlalchemy import Index, String, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class CACertificate(BaseModel):
    __tablename__ = "ca_certificates"
    __table_args__ = (
        Index("ix_ca_cert_service", "tenant_id", "service_id"),
    )

    service_id: Mapped[str] = mapped_column(String(100), nullable=False)
    cert_pem: Mapped[str] = mapped_column(TEXT, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

class CARevokedCert(BaseModel):
    __tablename__ = "ca_revoked_certs"
    __table_args__ = (
        Index("ix_ca_revoked_cert_id", "cert_id", unique=True),
    )

    cert_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=True)

class CATrustChain(BaseModel):
    __tablename__ = "ca_trust_chains"
    
    chain_name: Mapped[str] = mapped_column(String(100), nullable=False)
    root_ca_pem: Mapped[str] = mapped_column(TEXT, nullable=False)
    intermediate_ca_pem: Mapped[str] = mapped_column(TEXT, nullable=True)
