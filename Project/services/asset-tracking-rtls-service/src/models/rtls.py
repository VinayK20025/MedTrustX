"""
MedTrustX Asset Tracking RTLS Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Asset(BaseModel):
    """A physical entity (equipment, personnel) being tracked."""
    __tablename__ = "assets"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. wheelchair, infusion_pump
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class Tag(BaseModel):
    """The physical RTLS tag (BLE, RFID, UWB) associated with an asset."""
    __tablename__ = "tags"
    __table_args__ = (
        Index("ix_tag_tenant_asset", "tenant_id", "asset_id"),
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    tag_type: Mapped[str] = mapped_column(String(100), nullable=False) # ble, rfid, uwb
    identifier: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="paired")

class Location(BaseModel):
    """Real-time location snapshot of an asset."""
    __tablename__ = "locations"
    __table_args__ = (
        Index("ix_loc_tenant_asset", "tenant_id", "asset_id"),
        Index("ix_loc_zone", "zone"),
        Index("ix_loc_timestamp", "timestamp"),
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    coordinates: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class MovementEvent(BaseModel):
    """Transitions of assets between designated tracking zones."""
    __tablename__ = "movement_events"
    __table_args__ = (
        Index("ix_move_tenant_asset", "tenant_id", "asset_id"),
    )
    asset_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    from_zone: Mapped[str] = mapped_column(String(100), nullable=False)
    to_zone: Mapped[str] = mapped_column(String(100), nullable=False)
