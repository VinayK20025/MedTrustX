"""
MedTrustX DB Extraction Engine — Derived Table Models (§5)

These are PRECOMPUTED views built from events.
They are NOT copies of source data — they are derived insights.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class ExtractionBase(DeclarativeBase):
    __abstract__ = True
    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    tenant_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class PatientSummary(ExtractionBase):
    """Precomputed patient risk snapshot — updated via PATIENT_CREATED, VITALS_RECORDED events."""
    __tablename__ = "patient_summary"
    __table_args__ = (Index("ix_ps_tenant_risk", "tenant_id", "risk_level"),)
    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False, unique=True)
    patient_name: Mapped[str] = mapped_column(String(255), nullable=True)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False, default="low")
    last_visit: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    current_status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    ward: Mapped[str | None] = mapped_column(String(100), nullable=True)
    diagnosis_summary: Mapped[str | None] = mapped_column(Text, nullable=True)


class OperationalMetric(ExtractionBase):
    """Aggregated operational metrics — bed occupancy, staff util, incident rates."""
    __tablename__ = "operational_metrics"
    __table_args__ = (Index("ix_om_tenant_metric", "tenant_id", "metric_name"), Index("ix_om_ts", "timestamp"),)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    dimension: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class ClinicalInsight(ExtractionBase):
    """Derived clinical intelligence — readmission risk, anomaly flags."""
    __tablename__ = "clinical_insights"
    __table_args__ = (Index("ix_ci_tenant_type", "tenant_id", "insight_type"),)
    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    insight_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class FinancialSnapshot(ExtractionBase):
    """Revenue/cost aggregations per department/tenant."""
    __tablename__ = "financial_snapshots"
    __table_args__ = (Index("ix_fs_tenant_dept", "tenant_id", "department"),)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    revenue: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    period: Mapped[str] = mapped_column(String(50), nullable=False)


class SecurityMetric(ExtractionBase):
    """Security incident frequency and access violation counts."""
    __tablename__ = "security_metrics"
    __table_args__ = (Index("ix_sm_tenant_type", "tenant_id", "metric_type"),)
    metric_type: Mapped[str] = mapped_column(String(100), nullable=False)
    count: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    period: Mapped[str] = mapped_column(String(50), nullable=False)
