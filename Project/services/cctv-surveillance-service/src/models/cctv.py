"""
MedTrustX CCTV & Surveillance Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Camera(BaseModel):
    """Metadata and health status of an IP camera."""
    __tablename__ = "cameras"
    __table_args__ = (
        Index("ix_camera_tenant_status", "tenant_id", "status"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="online")

class VideoStream(BaseModel):
    """Active live stream session data."""
    __tablename__ = "video_streams"
    __table_args__ = (
        Index("ix_stream_tenant_camera", "tenant_id", "camera_id"),
    )
    camera_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    stream_url: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class Recording(BaseModel):
    """Metadata for archived video recordings."""
    __tablename__ = "recordings"
    __table_args__ = (
        Index("ix_recording_tenant_camera", "tenant_id", "camera_id"),
        Index("ix_recording_start_time", "start_time"),
    )
    camera_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    file_path: Mapped[str] = mapped_column(String(255), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

class SurveillanceEvent(BaseModel):
    """Events generated via computer vision or camera motion sensors."""
    __tablename__ = "surveillance_events"
    __table_args__ = (
        Index("ix_sevent_tenant_camera", "tenant_id", "camera_id"),
        Index("ix_sevent_type", "event_type"),
    )
    camera_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. motion, intrusion
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default={})
