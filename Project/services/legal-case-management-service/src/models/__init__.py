"""MedTrustX Legal Case Management Service — Models."""
from src.models.base import BaseModel
from src.models.legal import LegalCase, CaseDocument, CaseTask, ComplianceRecord
__all__ = ["BaseModel", "LegalCase", "CaseDocument", "CaseTask", "ComplianceRecord"]
