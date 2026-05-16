"""MedTrustX Executive Dashboard Service — Models."""
from src.models.base import BaseModel
from src.models.dashboard import Dashboard, KPI, DashboardWidget, AccessLog
__all__ = ["BaseModel", "Dashboard", "KPI", "DashboardWidget", "AccessLog"]
