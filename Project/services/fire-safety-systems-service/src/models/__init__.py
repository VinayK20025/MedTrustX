"""MedTrustX Safety Service — Models."""
from src.models.base import BaseModel
from src.models.safety import SafetyDevice, SafetyEvent, EmergencyAction, EvacuationLog
__all__ = ["BaseModel", "SafetyDevice", "SafetyEvent", "EmergencyAction", "EvacuationLog"]
