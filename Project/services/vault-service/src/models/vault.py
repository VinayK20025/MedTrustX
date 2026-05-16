"""
MedTrustX Vault Shim Service — Domain Entities
"""
import uuid

from sqlalchemy import Index, String, Integer, text
from sqlalchemy.dialects.postgresql import JSONB, BYTEA
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class VaultSecret(BaseModel):
    __tablename__ = "vault_secrets"
    __table_args__ = (
        Index("ix_vault_secret_path", "tenant_id", "secret_path", unique=True),
    )

    secret_path: Mapped[str] = mapped_column(String(255), nullable=False)
    # Stored encrypted in real vault, we use JSONB for the shim
    secret_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default=text("1"))

class VaultRole(BaseModel):
    __tablename__ = "vault_roles"
    __table_args__ = (
        Index("ix_vault_role_name", "tenant_id", "role_name", unique=True),
    )

    role_name: Mapped[str] = mapped_column(String(100), nullable=False)
    db_name: Mapped[str] = mapped_column(String(100), nullable=False)
    creation_statements: Mapped[str] = mapped_column(String(500), nullable=False)
    default_ttl: Mapped[int] = mapped_column(Integer, nullable=False, default=3600, server_default=text("3600"))

class VaultTransitKey(BaseModel):
    __tablename__ = "vault_transit_keys"
    __table_args__ = (
        Index("ix_vault_transit_name", "tenant_id", "key_name", unique=True),
    )

    key_name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_material: Mapped[bytes] = mapped_column(BYTEA, nullable=False) # In real life, wrapped/HSM protected
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default=text("1"))
