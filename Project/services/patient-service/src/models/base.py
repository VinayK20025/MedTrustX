"""
MedTrustX — Base Model

All domain entities inherit from this base. It provides:
  - UUID primary key
  - tenant_id for multi-tenancy (RLS)
  - created_at / updated_at timestamps
  - Soft-delete support via deleted_at
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class BaseModel(DeclarativeBase):
    """Abstract declarative base for all MedTrustX entities."""

    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
        comment="Tenant (hospital) isolation key",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
        nullable=False,
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
        comment="Soft-delete timestamp; NULL = active",
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def soft_delete(self) -> None:
        """Mark entity as deleted without physical removal."""
        self.deleted_at = datetime.now(timezone.utc)

    def restore(self) -> None:
        """Undo soft-delete."""
        self.deleted_at = None
