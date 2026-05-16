"""
Plugin Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional

class PluginEnableRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    name: str
    config: Dict[str, Any]
    route_id: Optional[str] = None
    service_id: Optional[str] = None

class PluginRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    name: str
    config: Dict[str, Any]
    enabled: bool
