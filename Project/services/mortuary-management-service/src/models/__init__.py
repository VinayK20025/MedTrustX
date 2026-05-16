"""MedTrustX Mortuary Management Service — Models."""
from src.models.base import BaseModel
from src.models.mortuary import MortuaryRecord, StorageUnit, BodyAllocation, CustodyLog, Release

__all__ = ["BaseModel", "MortuaryRecord", "StorageUnit", "BodyAllocation", "CustodyLog", "Release"]
