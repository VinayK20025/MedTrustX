"""
MedTrustX Device Trust Agent — TrustReport and AccessPolicy Data Models.

TrustReport is the top-level attestation document produced after every
full check cycle. It aggregates all 10 CheckResult instances, the
composite trust score, the assigned TrustLevel, the enforced
AccessPolicy, and metadata required by all four reporting targets
(zta-service, SIEM, Prometheus, OPA).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, model_validator

from src.models.check_result import CheckResult
from src.models.trust_level import TrustLevel


class AccessPolicy(BaseModel):
    """Computed access policy enforced when a TrustReport is processed.

    Derived from TrustLevel. Specifies which RBAC actions are allowed
    or denied, session duration, and MFA requirements.
    """

    trust_level: TrustLevel = Field(..., description="Trust level that drove this policy")
    allowed_actions: List[str] = Field(
        default_factory=list,
        description="RBAC actions explicitly permitted at this trust level",
    )
    denied_actions: List[str] = Field(
        default_factory=list,
        description="RBAC actions explicitly denied at this trust level",
    )
    session_duration_seconds: int = Field(
        default=0,
        ge=0,
        description="Permitted session length in seconds (0 = no session)",
    )
    mfa_required: bool = Field(
        default=True,
        description="Whether MFA must be presented for this session",
    )
    step_up_required: bool = Field(
        default=True,
        description="Whether step-up MFA is required for elevated operations",
    )
    revoke_sessions: bool = Field(
        default=False,
        description="Whether all existing sessions for this device must be revoked",
    )

    @classmethod
    def from_trust_level(cls, level: TrustLevel) -> "AccessPolicy":
        """Build the canonical AccessPolicy for a given TrustLevel."""
        if level == TrustLevel.BLOCKED:
            return cls(
                trust_level=level,
                allowed_actions=[],
                denied_actions=["*"],
                session_duration_seconds=0,
                mfa_required=True,
                step_up_required=True,
                revoke_sessions=True,
            )
        if level == TrustLevel.RESTRICTED:
            return cls(
                trust_level=level,
                allowed_actions=[
                    "read:clinical",
                    "read:own_profile",
                    "read:appointments",
                ],
                denied_actions=[
                    "write:clinical",
                    "admin:*",
                    "export:*",
                    "delete:*",
                    "write:appointments",
                    "write:prescriptions",
                ],
                session_duration_seconds=3600,
                mfa_required=True,
                step_up_required=True,
                revoke_sessions=False,
            )
        if level == TrustLevel.STANDARD:
            return cls(
                trust_level=level,
                allowed_actions=[
                    "read:clinical",
                    "write:clinical",
                    "read:own_profile",
                    "write:own_profile",
                    "read:appointments",
                    "write:appointments",
                    "read:prescriptions",
                    "write:prescriptions",
                    "read:lab_results",
                ],
                denied_actions=[
                    "admin:*",
                    "export:bulk",
                    "delete:records",
                ],
                session_duration_seconds=28800,
                mfa_required=False,
                step_up_required=False,
                revoke_sessions=False,
            )
        # TrustLevel.TRUSTED
        return cls(
            trust_level=level,
            allowed_actions=[
                "read:clinical",
                "write:clinical",
                "read:own_profile",
                "write:own_profile",
                "read:appointments",
                "write:appointments",
                "read:prescriptions",
                "write:prescriptions",
                "read:lab_results",
                "write:lab_results",
                "export:*",
                "admin:users",
                "admin:audit_logs",
                "admin:device_management",
                "delete:own_records",
            ],
            denied_actions=[
                "admin:system_config",
                "admin:security_policy",
            ],
            session_duration_seconds=43200,
            mfa_required=False,
            step_up_required=False,
            revoke_sessions=False,
        )


class TrustReport(BaseModel):
    """Complete device attestation report produced after every check cycle.

    Serialized and transmitted to all four reporting targets:
    zta-service (HTTPS POST), SIEM (CEF syslog), Prometheus (Pushgateway),
    and OPA (PUT device context).
    """

    report_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Globally unique report identifier (UUIDv4)",
    )
    device_id: str = Field(
        ...,
        description="Unique device identifier from iam_db devices table",
    )
    tenant_id: str = Field(
        ...,
        description="Tenant identifier for multi-tenant deployments",
    )
    user_id: str = Field(
        default="",
        description="Currently authenticated user identifier (may be empty if no session)",
    )
    platform: str = Field(
        ...,
        description="Operating system platform (Windows/macOS/Linux/iOS/Android)",
    )
    agent_mode: str = Field(
        default="native",
        description="Agent execution mode: native or browser",
    )
    agent_version: str = Field(
        default="1.0.0",
        description="Version string of the running agent",
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp when this report was generated",
    )
    check_results: List[CheckResult] = Field(
        default_factory=list,
        description="Results for all 10 (or available browser) checks",
    )
    composite_score: float = Field(
        default=0.0,
        ge=0.0,
        le=10.0,
        description="Final weighted trust score after override rules applied",
    )
    trust_level: TrustLevel = Field(
        default=TrustLevel.BLOCKED,
        description="Trust classification derived from composite_score",
    )
    override_applied: bool = Field(
        default=False,
        description="True when a score override rule changed the raw composite score",
    )
    override_reason: Optional[str] = Field(
        default=None,
        description="Human-readable explanation of which override rule was triggered",
    )
    access_policy: AccessPolicy = Field(
        default_factory=lambda: AccessPolicy.from_trust_level(TrustLevel.BLOCKED),
        description="Computed access policy enforced for this device",
    )
    next_check_in: int = Field(
        default=60,
        ge=5,
        description="Seconds until the next scheduled check cycle",
    )

    def get_check_by_id(self, check_id: int) -> Optional[CheckResult]:
        """Return the CheckResult for the given check_id, or None if not found."""
        for result in self.check_results:
            if result.check_id == check_id:
                return result
        return None

    def get_check_scores_dict(self) -> Dict[str, float]:
        """Return a dict mapping OPA check key names to their scores.

        Used to populate the OPA device context document.
        """
        key_names = {
            1: "os_patch",
            2: "antivirus",
            3: "disk_encryption",
            4: "firewall",
            5: "screen_lock",
            6: "jailbreak",
            7: "certificate",
            8: "network",
            9: "processes",
            10: "behavioral",
        }
        result: Dict[str, float] = {}
        for check in self.check_results:
            key = key_names.get(check.check_id, f"check_{check.check_id}")
            result[key] = check.score
        return result

    def to_opa_document(self) -> Dict[str, Any]:
        """Build the OPA device context document for PUT /v1/data/medtrustx/devices/{id}.

        Schema must match what access_decision.rego expects.
        """
        return {
            "device_id": self.device_id,
            "trust_score": self.composite_score,
            "trust_level": self.trust_level.opa_trust_level,
            "checks": self.get_check_scores_dict(),
            "platform": self.platform,
            "last_attested": self.timestamp.isoformat(),
            "blocked": self.trust_level == TrustLevel.BLOCKED,
            "restricted": self.trust_level == TrustLevel.RESTRICTED,
            "trusted": self.trust_level == TrustLevel.TRUSTED,
            "agent_mode": self.agent_mode,
            "agent_version": self.agent_version,
            "tenant_id": self.tenant_id,
            "override_applied": self.override_applied,
        }

    def to_zta_payload(self) -> Dict[str, Any]:
        """Build the JSON payload for POST /api/zta/device/attest."""
        return {
            "report_id": self.report_id,
            "device_id": self.device_id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "platform": self.platform,
            "agent_mode": self.agent_mode,
            "agent_version": self.agent_version,
            "timestamp": self.timestamp.isoformat(),
            "composite_score": self.composite_score,
            "trust_level": self.trust_level.value,
            "override_applied": self.override_applied,
            "override_reason": self.override_reason,
            "checks": [r.model_dump() for r in self.check_results],
            "access_policy": self.access_policy.model_dump(),
            "next_check_in": self.next_check_in,
        }

    def to_prometheus_labels(self) -> Dict[str, str]:
        """Return Prometheus label set used for all pushed metrics."""
        return {
            "device_id": self.device_id,
            "tenant_id": self.tenant_id,
            "platform": self.platform,
            "agent_mode": self.agent_mode,
        }

    model_config = {
        "json_encoders": {
            datetime: lambda v: v.isoformat(),
        }
    }
