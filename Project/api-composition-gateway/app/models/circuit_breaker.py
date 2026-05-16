"""
Circuit Breaker Models.
"""
from pydantic import BaseModel, ConfigDict

class CircuitStateEvent(BaseModel):
    model_config = ConfigDict(strict=True)
    event: str
    service: str
    state: str
    failures: int
    timestamp: float
