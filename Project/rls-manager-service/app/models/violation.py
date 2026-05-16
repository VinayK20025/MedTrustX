from typing import Any, Dict, List
from pydantic import BaseModel, ConfigDict

class ViolationStats(BaseModel):
    model_config = ConfigDict(strict=True)
    violations_last_24h: int
    violations_last_7d: int
    top_violating_users: List[Dict[str, Any]]
    most_targeted_tenants: List[Dict[str, Any]]
    blocked_count: int
    privileged_allowed_count: int
