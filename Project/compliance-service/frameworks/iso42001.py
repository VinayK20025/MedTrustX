"""
ISO 42001 Framework Controls.
"""
from app.models.control import FrameworkControl

ISO42001_CONTROLS = [
    FrameworkControl(
        control_id="ISO42001-A.2.1",
        framework="ISO 42001:2023",
        category="AI Risk Management",
        title="AI Risk Assessment",
        description="Assess risks related to AI systems.",
        requirement="Perform continuous risk assessment for AI.",
        implementation="ai-service requests map to specific consent requirements and risk profiles.",
        evidence_source="consent_registry",
        automated=True,
        severity="high"
    ),
    FrameworkControl(
        control_id="ISO42001-A.3.1",
        framework="ISO 42001:2023",
        category="Data Quality",
        title="Data Governance for AI",
        description="Ensure data used in AI meets quality and compliance constraints.",
        requirement="Data governance policies shall be enforced.",
        implementation="Consent registry enforces ai_model_training consent before inference.",
        evidence_source="consent_registry",
        automated=True,
        severity="critical"
    )
]
