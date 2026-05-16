"""MedTrustX Consent Service — Models."""
from src.models.base import BaseModel
from src.models.consent import Consent, ConsentRecord, ConsentLog, ConsentValidation, ConsentPolicy

__all__ = ["BaseModel", "Consent", "ConsentRecord", "ConsentLog", "ConsentValidation", "ConsentPolicy"]
