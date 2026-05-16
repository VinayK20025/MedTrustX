"""MedTrustX Postal Mail Service — Models."""
from src.models.base import BaseModel
from src.models.postal import EmailMessage, EmailLog, EmailQueue, EmailBounce

__all__ = ["BaseModel", "EmailMessage", "EmailLog", "EmailQueue", "EmailBounce"]
