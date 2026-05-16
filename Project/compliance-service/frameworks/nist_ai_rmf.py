"""
NIST AI RMF Framework Controls.
"""
from app.models.control import FrameworkControl

NIST_AI_RMF_CONTROLS = [
    FrameworkControl(
        control_id="NIST-AI-GOV-1",
        framework="NIST AI RMF",
        category="Govern",
        title="AI Governance",
        description="Policies and procedures for AI are in place.",
        requirement="Govern AI risks.",
        implementation="Consent and audit services ensure transparent AI data usage.",
        evidence_source="consent_registry",
        automated=True,
        severity="high"
    )
]
