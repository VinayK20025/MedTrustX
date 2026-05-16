"""MedTrustX Diagnostics Service — Models."""
from src.models.base import BaseModel
from src.models.diagnostics import DiagnosticOrder, Sample, Result, ImagingResult

__all__ = ["BaseModel", "DiagnosticOrder", "Sample", "Result", "ImagingResult"]
