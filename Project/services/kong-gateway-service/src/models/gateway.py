"""
MedTrustX Kong Gateway Shim Service — Domain Entities

Five tables mirroring the Kong Admin API data model:
services, routes, consumers, plugins, and credentials.
"""
import uuid

from sqlalchemy import Boolean, ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, TEXT, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class GatewayService(BaseModel):
    """An upstream microservice registered behind the gateway."""
    __tablename__ = "gateway_services"
    __table_args__ = (
        Index("ix_gw_service_name", "tenant_id", "name", unique=True),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    url: Mapped[str] = mapped_column(TEXT, nullable=False)  # upstream URL
    protocol: Mapped[str] = mapped_column(String(10), nullable=False, default="http")
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))


class GatewayRoute(BaseModel):
    """A path-based route that maps to a registered service."""
    __tablename__ = "gateway_routes"
    __table_args__ = (
        Index("ix_gw_route_path", "tenant_id", "path"),
    )

    service_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    path: Mapped[str] = mapped_column(String(200), nullable=False)
    methods: Mapped[str] = mapped_column(String(50), nullable=False, default="GET,POST")
    strip_path: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))


class GatewayConsumer(BaseModel):
    """An API consumer (user / service account) with rate-limit identity."""
    __tablename__ = "gateway_consumers"
    __table_args__ = (
        Index("ix_gw_consumer_uname", "tenant_id", "username", unique=True),
    )

    username: Mapped[str] = mapped_column(String(100), nullable=False)
    custom_id: Mapped[str | None] = mapped_column(String(100), nullable=True)


class GatewayPlugin(BaseModel):
    """A plugin instance (rate-limiting, JWT auth, CORS, etc.)."""
    __tablename__ = "gateway_plugins"

    service_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    route_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "jwt", "rate-limiting"
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))


class GatewayCredential(BaseModel):
    """Credentials tied to a consumer (API key, JWT secret, etc.)."""
    __tablename__ = "gateway_credentials"

    consumer_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    cred_type: Mapped[str] = mapped_column(String(50), nullable=False)  # api-key, jwt, oauth2
    secret: Mapped[str] = mapped_column(TEXT, nullable=False)
