"""MedTrustX OPA Service — Models."""
from src.models.base import BaseModel
from src.models.opa import OPAPolicy, OPAData, OPADecision

__all__ = ["BaseModel", "OPAPolicy", "OPAData", "OPADecision"]
