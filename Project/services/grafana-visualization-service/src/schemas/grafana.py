"""
MedTrustX Grafana Visualization Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Dashboards ──

class DashboardCreate(BaseModel):
    name: str
    config: Dict[str, Any]


class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    config: Dict[str, Any]
    created_at: datetime


# ── Panels ──

class PanelCreate(BaseModel):
    dashboard_id: uuid.UUID
    panel_type: str
    query: Optional[str] = None
    config: Dict[str, Any]


class PanelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    dashboard_id: uuid.UUID
    panel_type: str
    query: Optional[str] = None
    config: Dict[str, Any]


# ── Data Sources ──

class DataSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    type: str
    config: Dict[str, Any]


# ── Alerts ──

class AlertVisualizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    alert_id: uuid.UUID
    dashboard_id: uuid.UUID
