"""
Route Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class RouteCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    name: str
    paths: List[str]
    service_id: str
    strip_path: Optional[bool] = False

class RouteRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    name: str
    paths: List[str]
    service: dict
