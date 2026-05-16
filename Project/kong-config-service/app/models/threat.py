"""
Threat Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List
from datetime import datetime

class ThreatReport(BaseModel):
    model_config = ConfigDict(strict=True)
    total_threats: int
    threat_counts_by_type: Dict[str, int]
    recent_blocked_ips: List[str]
    timestamp: datetime

class BlockIPRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    ip_address: str
    reason: str
    duration_minutes: int
