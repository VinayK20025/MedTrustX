"""
MedTrustX ICU Service — Domain Entities

Tables:
  icu_patients    – Active and historical ICU admissions
  icu_vitals      – High-frequency telemetry stream
  device_data     – JSON payloads from integrated IoMT devices
  icu_alerts      – Critical warnings generated from streaming data
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    DateTime,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class ICUPatient(BaseModel):
    """
    Admission record for a patient into the ICU.
    """

    __tablename__ = "icu_patients"
    __table_args__ = (
        Index("ix_icu_patient", "tenant_id", "patient_id"),
        Index("ix_icu_status", "tenant_id", "status"),
        {"comment": "ICU admission records"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    
    bed_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Physical location/bed tracking",
    )

    admitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | discharged",
    )


class ICUVitals(BaseModel):
    """
    Time-series table for streaming vitals data.
    """

    __tablename__ = "icu_vitals"
    __table_args__ = (
        Index("ix_vitals_patient_time", "tenant_id", "patient_id", "recorded_at"),
        {"comment": "High-frequency streaming vitals"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    metric: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., HR, BP, SpO2",
    )
    
    value: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )


class DeviceData(BaseModel):
    """
    Raw streaming telemetry from connected devices (ventilators, monitors).
    """

    __tablename__ = "device_data"
    __table_args__ = (
        Index("ix_device_patient_time", "tenant_id", "patient_id", "recorded_at"),
        Index("ix_device_id", "tenant_id", "device_id"),
        {"comment": "Raw IoMT device telemetry payload"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    data: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )


class ICUAlert(BaseModel):
    """
    Critical conditions identified by thresholds or CDSS.
    """

    __tablename__ = "icu_alerts"
    __table_args__ = (
        Index("ix_alert_patient", "tenant_id", "patient_id"),
        Index("ix_alert_severity", "tenant_id", "severity"),
        {"comment": "Critical ICU conditions"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    alert_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    
    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="low | medium | high | critical",
    )
    
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
