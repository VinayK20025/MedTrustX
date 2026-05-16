"""
MedTrustX OPA Shim Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID, TEXT, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class OPAPolicy(BaseModel):
    __tablename__ = "opa_policies"
    __table_args__ = (
        Index("ix_opa_policy_pkg", "package_name"),
    )

    package_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rego_code: Mapped[str] = mapped_column(TEXT, nullable=False)

class OPAData(BaseModel):
    __tablename__ = "opa_data"
    __table_args__ = (
        Index("ix_opa_data_pkg", "package_name"),
    )

    package_name: Mapped[str] = mapped_column(String(100), nullable=False)
    json_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))

class OPADecision(BaseModel):
    __tablename__ = "opa_decisions"

    package_name: Mapped[str] = mapped_column(String(100), nullable=False)
    input_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    result_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
