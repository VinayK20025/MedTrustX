"""MedTrustX Infection Control Service — Models."""
from src.models.base import BaseModel
from src.models.infection import Infection, InfectionEvent, IsolationCase, InfectionAudit, AntimicrobialResistance

__all__ = ["BaseModel", "Infection", "InfectionEvent", "IsolationCase", "InfectionAudit", "AntimicrobialResistance"]
