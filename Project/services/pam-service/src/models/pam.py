"""
MedTrustX PAM Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class PrivilegedAccount(BaseModel):
    __tablename__ = "privileged_accounts"
    __table_args__ = (
        Index("ix_priv_acc_status", "status"),
    )

    account_name: Mapped[str] = mapped_column(String(100), nullable=False)
    system: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))


class PrivilegeRequest(BaseModel):
    __tablename__ = "privilege_requests"
    __table_args__ = (
        Index("ix_priv_req_tenant_user", "tenant_id", "user_id"),
        Index("ix_priv_req_status", "status"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    requested_role: Mapped[str] = mapped_column(String(100), nullable=False)
    reason: Mapped[str] = mapped_column(TEXT, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
    approved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class PrivilegedSession(BaseModel):
    __tablename__ = "privileged_sessions"
    __table_args__ = (
        Index("ix_priv_sess_tenant_user", "tenant_id", "user_id"),
        Index("ix_priv_sess_status", "status"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    session_token: Mapped[str] = mapped_column(TEXT, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
    ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class ApprovalWorkflow(BaseModel):
    __tablename__ = "approval_workflows"
    
    request_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    approver_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    acted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class CredentialReference(BaseModel):
    __tablename__ = "credential_references"
    __table_args__ = (
        Index("ix_cred_ref_acc_id", "account_id"),
    )

    account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    vault_path: Mapped[str] = mapped_column(TEXT, nullable=False)
    rotated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
