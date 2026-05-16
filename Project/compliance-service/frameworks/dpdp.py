"""
DPDP Framework Controls.
"""
from app.models.control import FrameworkControl

DPDP_CONTROLS = [
    FrameworkControl(
        control_id="DPDP-Sec.8(4)",
        framework="DPDP",
        category="Security Safeguards",
        title="Reasonable Security Safeguards",
        description="Protect personal data in its possession or under its control.",
        requirement="Implement reasonable security safeguards to prevent personal data breach.",
        implementation="Multi-tenant database isolation, ZTA, and continuous audit.",
        evidence_source="audit_log",
        automated=True,
        severity="high"
    ),
    FrameworkControl(
        control_id="DPDP-Sec.6",
        framework="DPDP",
        category="Consent",
        title="Consent of Data Principal",
        description="Personal data to be processed only for lawful purpose and valid consent.",
        requirement="Obtain valid consent from the Data Principal.",
        implementation="Centralized consent-service tracking grants and withdrawals.",
        evidence_source="consent_registry",
        automated=True,
        severity="critical"
    )
]
