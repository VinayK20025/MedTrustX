"""
MedTrustX Emergency Break-Glass Service — Domain Entities

Four core tables implementing the full break-glass lifecycle:
  Request → Approval → Session → Audit
"""
import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String, Text, TypeDecorator
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel


class JSONType(TypeDecorator):
    """Portable JSON column — uses native JSON on all backends."""
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None


class BreakGlassRequest(BaseModel):
    """
    Emergency access request — submitted by a user during a crisis.
    Contains justification text and rich context (patient_id, room, vitals).
    """
    __tablename__ = "break_glass_requests"
    __table_args__ = (
        Index("ix_bgr_tenant_user", "tenant_id", "user_id"),
        Index("ix_bgr_status", "status"),
    )
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    justification: Mapped[str] = mapped_column(Text, nullable=False)
    context: Mapped[dict] = mapped_column(JSONType, nullable=False, default={})
    # Context examples:
    #   Clinical: {patient_id, icu_room, vitals_snapshot, emergency_type: "cardiac_arrest"}
    #   Security: {incident_id, zone, threat_level}
    #   Legal:    {court_order_id, evidence_id}
    #   Infra:    {service_name, failure_type, severity}
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False, default="high")
    policy_name: Mapped[str] = mapped_column(String(100), nullable=False, default="general_emergency")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    # Status flow: pending → approved|denied → activated → expired|revoked
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    mfa_verified: Mapped[bool] = mapped_column(default=False)
    device_compliant: Mapped[bool] = mapped_column(default=False)


class BreakGlassApproval(BaseModel):
    """
    Approval/denial record — may require dual approval for high-risk scopes.
    """
    __tablename__ = "break_glass_approvals"
    __table_args__ = (
        Index("ix_bga_tenant_req", "tenant_id", "request_id"),
    )
    request_id: Mapped[str] = mapped_column(String(36), nullable=False)
    approver_id: Mapped[str] = mapped_column(String(36), nullable=False)
    decision: Mapped[str] = mapped_column(String(50), nullable=False)  # approved|denied
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class BreakGlassSession(BaseModel):
    """
    Active elevated-privilege session — time-bound, scoped, revocable.
    All downstream services check this table before allowing override access.
    """
    __tablename__ = "break_glass_sessions"
    __table_args__ = (
        Index("ix_bgs_tenant_req", "tenant_id", "request_id"),
        Index("ix_bgs_expires", "expires_at"),
        Index("ix_bgs_status", "status"),
    )
    request_id: Mapped[str] = mapped_column(String(36), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    scope: Mapped[dict] = mapped_column(JSONType, nullable=False, default={})
    # Scope examples:
    #   {resources: ["patient_ehr"], patient_id: "...", permissions: ["read", "critical_write"]}
    #   {resources: ["cctv", "access_control"], zone: "gate-3", permissions: ["read", "execute"]}
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    # Status: active → expired|revoked
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    revoked_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class BreakGlassAudit(BaseModel):
    """
    Immutable, append-only audit log — every action during a break-glass session.
    This is the forensic backbone for post-incident review.
    """
    __tablename__ = "break_glass_audit"
    __table_args__ = (
        Index("ix_bgaud_tenant_session", "tenant_id", "session_id"),
        Index("ix_bgaud_action", "action"),
    )
    session_id: Mapped[str] = mapped_column(String(36), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    # Actions: read_allergies, update_medication, view_cctv, lock_door, run_query, etc.
    resource: Mapped[str] = mapped_column(String(255), nullable=False)
    audit_metadata: Mapped[dict] = mapped_column(JSONType, nullable=False, default={})
    # audit_metadata: {patient_id, file_hash, sql_query, result_count, watermark_id}
