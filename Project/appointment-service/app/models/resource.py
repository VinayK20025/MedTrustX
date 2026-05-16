"""
Resource Models.
"""
from pydantic import BaseModel
from typing import Optional

class ResourceRequest(BaseModel):
    resource_type: str
    time_slot: str
    quantity: Optional[int] = 1
