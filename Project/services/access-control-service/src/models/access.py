"""
MedTrustX Access Control Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class AccessRequest(BaseModel):
    __tablename__ = "access_requests"
    __table_args__ = (
        Index("ix_acc_req_tenant_user", "tenant_id", "user_id"),
        Index("ix_acc_req_res_act", "resource", "action"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    context: Mapped[dict] = mapped_column(JSONB, nullable=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class AccessDecision(BaseModel):
    __tablename__ = "access_decisions"
    __table_args__ = (
        Index("ix_acc_dec_tenant_req", "tenant_id", "request_id"),
        Index("ix_acc_dec_dec_time", "decision", "evaluated_at"),
    )

    request_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    reason: Mapped[str] = mapped_column(TEXT, nullable=True)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class PolicyBinding(BaseModel):
    __tablename__ = "policy_bindings"
    __table_args__ = (
        Index("ix_pol_bind_tenant_role", "tenant_id", "role_id"),
    )

    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    policy_name: Mapped[str] = mapped_column(String(100), nullable=False)


class AttributeStore(BaseModel):
    __tablename__ = "attribute_store"
    __table_args__ = (
        Index("ix_attr_store_tenant_key", "tenant_id", "attribute_key"),
    )

    attribute_key: Mapped[str] = mapped_column(String(100), nullable=False)
    attribute_value: Mapped[dict] = mapped_column(JSONB, nullable=False)


class AccessLog(BaseModel):
    __tablename__ = "access_logs"
    __table_args__ = (
        Index("ix_acc_log_tenant_user", "tenant_id", "user_id"),
        Index("ix_acc_log_dec_time", "decision", "timestamp"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
