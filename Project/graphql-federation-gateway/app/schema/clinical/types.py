"""
Clinical GraphQL Types.
"""
import strawberry
from typing import List, Optional
from app.schema.patient.types import VitalSign, Condition

@strawberry.type
class Order:
    id: str
    type: str
    status: str
    date: str

@strawberry.type
class Result:
    id: str
    test_name: str
    value: str
    date: str

@strawberry.type
class ClinicalSummaryData:
    vitals: List[VitalSign]
    conditions: List[Condition]
    orders: List[Order]
    results: List[Result]
    ai_insights: Optional[str]
