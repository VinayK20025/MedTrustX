"""MedTrustX Appointments Service — Models."""
from src.models.base import BaseModel
from src.models.appointments import Schedule, Slot, Appointment, Queue

__all__ = ["BaseModel", "Schedule", "Slot", "Appointment", "Queue"]
