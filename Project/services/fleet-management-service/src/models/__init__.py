"""MedTrustX Fleet Management Service — Models."""
from src.models.base import BaseModel
from src.models.fleet import Vehicle, Driver, Trip, Assignment, VehicleTracking

__all__ = ["BaseModel", "Vehicle", "Driver", "Trip", "Assignment", "VehicleTracking"]
