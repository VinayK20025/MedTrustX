"""
MedTrustX Data Governance Service — Domain Entities

Five tables governing data catalog, classifications, lineage,
quality rules, and retention lifecycle across the enterprise.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class DataAsset(BaseModel):
    """Catalog entry representing a table, file, model, or stream."""
    __tablename__ = "data_assets"
    __table_args__ = (
        Index("ix_dg_asset_name", "tenant_id", "name"),
        Index("ix_dg_asset_owner", "tenant_id", "owner"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # database_table, s3_bucket, kafka_topic, ai_model
    owner: Mapped[str] = mapped_column(String(100), nullable=False)  # role or user_id


class DataClassification(BaseModel):
    """Classification tagging for an asset (e.g. PHI, PII)."""
    __tablename__ = "data_classifications"
    __table_args__ = (
        Index("ix_dg_class_asset", "tenant_id", "asset_id"),
        Index("ix_dg_class_level", "tenant_id", "sensitivity_level"),
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    classification: Mapped[str] = mapped_column(String(50), nullable=False)  # phi, pii, financial, public
    sensitivity_level: Mapped[str] = mapped_column(String(20), nullable=False, default="internal")  # public, internal, confidential, restricted
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class DataLineage(BaseModel):
    """Tracks flow and transformation of data from source to target."""
    __tablename__ = "data_lineage"
    __table_args__ = (
        Index("ix_dg_lineage_src", "tenant_id", "source_asset"),
        Index("ix_dg_lineage_tgt", "tenant_id", "target_asset"),
    )

    source_asset: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    target_asset: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    transformation: Mapped[str] = mapped_column(Text, nullable=False, default="")
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class DataQualityRule(BaseModel):
    """Rules ensuring data integrity and completeness."""
    __tablename__ = "data_quality_rules"
    __table_args__ = (
        Index("ix_dg_qual_asset", "tenant_id", "asset_id"),
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    rule: Mapped[str] = mapped_column(Text, nullable=False)  # no_null_ssn, valid_icd10
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, disabled, failing


class DataRetentionPolicy(BaseModel):
    """Lifecycle policy dictating how long data is kept and disposal action."""
    __tablename__ = "data_retention_policies"
    __table_args__ = (
        Index("ix_dg_ret_asset", "tenant_id", "asset_id"),
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    retention_period: Mapped[int] = mapped_column(Integer, nullable=False)  # in days
    action: Mapped[str] = mapped_column(String(50), nullable=False, default="archive")  # archive, delete, anonymize
