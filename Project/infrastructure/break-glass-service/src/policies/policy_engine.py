"""
MedTrustX Break-Glass — Emergency Override Policy Engine

Policy-driven decisions — NO manual logic in code.
Each policy defines: who can request, scope, approval, duration.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class BreakGlassPolicy:
    name: str
    description: str
    auto_approve: bool = False
    require_dual_approval: bool = False
    require_mfa: bool = True
    max_duration_minutes: int = 30
    allowed_scopes: List[str] = field(default_factory=list)
    conditions: Dict[str, str] = field(default_factory=dict)
    allowed_roles: List[str] = field(default_factory=list)


# Pre-defined emergency policies
POLICIES: Dict[str, BreakGlassPolicy] = {
    # CASE 1: ICU Cardiac Arrest
    "clinical_emergency": BreakGlassPolicy(
        name="clinical_emergency",
        description="Life-threatening clinical event — auto-approved for attending physicians",
        auto_approve=True,
        require_dual_approval=False,
        require_mfa=True,
        max_duration_minutes=30,
        allowed_scopes=["patient_ehr", "patient_allergies", "patient_medications", "critical_write"],
        conditions={"emergency_type": "life_critical"},
        allowed_roles=["physician", "attending_doctor", "icu_nurse", "emergency_physician"],
    ),
    # CASE 2: Active Security Breach
    "security_incident": BreakGlassPolicy(
        name="security_incident",
        description="Physical/cyber security breach — requires supervisor approval",
        auto_approve=False,
        require_dual_approval=True,
        require_mfa=True,
        max_duration_minutes=20,
        allowed_scopes=["cctv", "access_control", "incident_logs", "door_controls"],
        conditions={"threat_level": "active"},
        allowed_roles=["security_officer", "security_supervisor", "soc_analyst"],
    ),
    # CASE 3: Legal Evidence Access
    "legal_compliance": BreakGlassPolicy(
        name="legal_compliance",
        description="Court-ordered evidence access — compliance officer approval required",
        auto_approve=False,
        require_dual_approval=False,
        require_mfa=True,
        max_duration_minutes=60,
        allowed_scopes=["evidence_read", "evidence_export_watermarked"],
        conditions={"court_order_valid": "true"},
        allowed_roles=["legal_officer", "compliance_officer", "chief_legal"],
    ),
    # CASE 4: Infrastructure Outage
    "infrastructure_emergency": BreakGlassPolicy(
        name="infrastructure_emergency",
        description="Production system outage — SRE lead approval required",
        auto_approve=False,
        require_dual_approval=False,
        require_mfa=True,
        max_duration_minutes=15,
        allowed_scopes=["database_admin_limited", "service_restart", "recovery_queries"],
        conditions={"severity": "critical"},
        allowed_roles=["devops_engineer", "sre_lead", "platform_admin"],
    ),
    # General fallback
    "general_emergency": BreakGlassPolicy(
        name="general_emergency",
        description="General emergency — always requires approval",
        auto_approve=False,
        require_dual_approval=True,
        require_mfa=True,
        max_duration_minutes=15,
        allowed_scopes=["read_only"],
        conditions={},
        allowed_roles=["any_authenticated"],
    ),
}


def get_policy(name: str) -> Optional[BreakGlassPolicy]:
    return POLICIES.get(name)


def evaluate_auto_approval(policy: BreakGlassPolicy, context: dict, user_role: str) -> bool:
    """Determine if request can be auto-approved based on policy + context."""
    if not policy.auto_approve:
        return False
    if user_role not in policy.allowed_roles and "any_authenticated" not in policy.allowed_roles:
        return False
    # Check conditions against context
    for key, expected in policy.conditions.items():
        if context.get(key) != expected:
            return False
    return True
