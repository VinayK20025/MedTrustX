"""
MedTrustX DB Integration — Audit Mixin (§8)

Every domain model across all 108 services must include:
- Soft deletes (deleted_at)
- Creator/updater tracking (created_by, updated_by)
- Row versioning (version) — critical for clinical data

This mixin is applied via Python multiple inheritance.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, declared_attr


class AuditMixin:
    """
    §8 — Drop-in mixin adding audit columns to any SQLAlchemy model.

    Usage:
        class Patient(BaseModel, AuditMixin):
            __tablename__ = "patients"
            name = Column(String(255))
            ...

    This adds: created_by, updated_by, version, deleted_at
    """

    @declared_attr
    def created_by(cls) -> Mapped[uuid.UUID | None]:
        return mapped_column(
            PG_UUID(as_uuid=True), nullable=True,
            comment="UUID of user who created this record",
        )

    @declared_attr
    def updated_by(cls) -> Mapped[uuid.UUID | None]:
        return mapped_column(
            PG_UUID(as_uuid=True), nullable=True,
            comment="UUID of user who last updated this record",
        )

    @declared_attr
    def version(cls) -> Mapped[int]:
        return mapped_column(
            Integer, default=1, server_default=text("1"), nullable=False,
            comment="Optimistic concurrency version counter",
        )

    @declared_attr
    def deleted_at(cls) -> Mapped[datetime | None]:
        return mapped_column(
            DateTime(timezone=True), nullable=True, default=None,
            comment="Soft delete timestamp — NULL means active",
        )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def soft_delete(self, deleted_by: uuid.UUID = None) -> None:
        self.deleted_at = datetime.now(timezone.utc)
        if deleted_by:
            self.updated_by = deleted_by
        self.version += 1

    def restore(self, restored_by: uuid.UUID = None) -> None:
        self.deleted_at = None
        if restored_by:
            self.updated_by = restored_by
        self.version += 1

    def bump_version(self, updated_by: uuid.UUID = None) -> None:
        """Increment version for optimistic concurrency control."""
        self.version += 1
        if updated_by:
            self.updated_by = updated_by
