"""
MedTrustX Device Trust Agent — CheckResult Data Model.

Defines the CheckResult Pydantic model that carries the output of a
single security check: its score, weighted contribution, raw details,
remediation recommendations, timing, and whether it triggers an
immediate block override.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class CheckResult(BaseModel):
    """Output of a single device security check.

    Produced by each check module's execute() method and aggregated
    by ScoreEngine into the final TrustReport.
    """

    check_id: int = Field(
        ...,
        ge=1,
        le=10,
        description="Check identifier (1–10) matching the check specification",
    )
    check_name: str = Field(
        ...,
        min_length=1,
        description="Human-readable check name (e.g. 'OS Patch Level')",
    )
    platform: str = Field(
        ...,
        description="Platform this check ran on (Windows/macOS/Linux/iOS/Android)",
    )
    score: float = Field(
        ...,
        ge=1.0,
        le=10.0,
        description="Raw check score from 1.0 (worst) to 10.0 (best)",
    )
    weight: float = Field(
        ...,
        gt=0.0,
        le=1.0,
        description="Weight assigned to this check in composite score computation",
    )
    weighted_score: float = Field(
        default=0.0,
        description="Computed as score × weight; populated by ScoreEngine",
    )
    passed: bool = Field(
        default=False,
        description="True when score >= 6.0 (meets baseline threshold)",
    )
    details: Dict[str, Any] = Field(
        default_factory=dict,
        description="Raw check findings — platform-specific key/value pairs",
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Ordered list of remediation steps to improve this check score",
    )
    duration_ms: int = Field(
        default=0,
        ge=0,
        description="Wall-clock execution time of the check in milliseconds",
    )
    error: Optional[str] = Field(
        default=None,
        description="Exception message if check failed to execute; implies score=1",
    )
    immediate_block: bool = Field(
        default=False,
        description=(
            "When True, overrides the composite score to 0.0 regardless of all "
            "other check results. Only checks 6, 7, and 9 may set this flag."
        ),
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp when this check completed",
    )

    @field_validator("score")
    @classmethod
    def validate_score_range(cls, v: float) -> float:
        """Clamp score to valid [1.0, 10.0] range and round to 2 decimal places."""
        clamped = max(1.0, min(10.0, v))
        return round(clamped, 2)

    @model_validator(mode="after")
    def compute_derived_fields(self) -> "CheckResult":
        """Compute weighted_score and passed from score and weight."""
        self.weighted_score = round(self.score * self.weight, 4)
        self.passed = self.score >= 6.0
        return self

    @model_validator(mode="after")
    def validate_immediate_block_eligibility(self) -> "CheckResult":
        """Enforce that only checks 6, 7, and 9 may set immediate_block=True."""
        if self.immediate_block and self.check_id not in (6, 7, 9):
            raise ValueError(
                f"Check {self.check_id} ({self.check_name}) is not eligible to set "
                "immediate_block=True. Only checks 6 (Jailbreak), 7 (Certificate), "
                "and 9 (Process Integrity) may trigger an immediate block."
            )
        return self

    @model_validator(mode="after")
    def auto_immediate_block(self) -> "CheckResult":
        """Automatically set immediate_block=True when eligible checks score 1."""
        if self.check_id in (6, 7, 9) and self.score <= 1.0:
            self.immediate_block = True
        return self

    def to_summary(self) -> Dict[str, Any]:
        """Return a concise summary dict for logging and OPA context updates."""
        return {
            "check_id": self.check_id,
            "check_name": self.check_name,
            "score": self.score,
            "weighted_score": self.weighted_score,
            "passed": self.passed,
            "immediate_block": self.immediate_block,
            "duration_ms": self.duration_ms,
            "error": self.error,
        }

    def to_cef_extension(self) -> Dict[str, str]:
        """Return CEF extension fields for SIEM syslog output."""
        return {
            "checkId": str(self.check_id),
            "checkName": self.check_name,
            "score": str(self.score),
            "weightedScore": str(self.weighted_score),
            "passed": "true" if self.passed else "false",
            "immediateBlock": "true" if self.immediate_block else "false",
            "durationMs": str(self.duration_ms),
            "platform": self.platform,
        }

    model_config = {
        "json_encoders": {
            datetime: lambda v: v.isoformat(),
        }
    }
