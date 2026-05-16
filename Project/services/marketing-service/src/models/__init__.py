"""MedTrustX Marketing Service — Models."""
from src.models.base import BaseModel
from src.models.marketing import Campaign, CampaignTarget, Segment, EngagementEvent, Funnel

__all__ = ["BaseModel", "Campaign", "CampaignTarget", "Segment", "EngagementEvent", "Funnel"]
