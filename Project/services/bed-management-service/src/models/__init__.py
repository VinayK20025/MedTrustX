"""MedTrustX Bed Management Service — Models."""
from src.models.base import BaseModel
from src.models.beds import Bed, BedAllocation, BedReservation, BedTransfer, BedStatusLog

__all__ = ["BaseModel", "Bed", "BedAllocation", "BedReservation", "BedTransfer", "BedStatusLog"]
