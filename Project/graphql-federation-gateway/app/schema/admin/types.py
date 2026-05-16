"""
Admin GraphQL Types.
"""
import strawberry
from typing import List, Optional

@strawberry.type
class IamStat:
    metric: str
    value: int

@strawberry.type
class ComplianceStat:
    framework: str
    score: float

@strawberry.type
class AdminOverviewData:
    iam_stats: List[IamStat]
    compliance_scores: List[ComplianceStat]
    active_threats: int
