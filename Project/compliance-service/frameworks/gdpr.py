"""
GDPR Framework Controls.
"""
from app.models.control import FrameworkControl

GDPR_CONTROLS = [
    FrameworkControl(
        control_id="GDPR-Art.5(1)(f)",
        framework="GDPR",
        category="Data Security",
        title="Integrity and Confidentiality",
        description="Processed in a manner that ensures appropriate security of the personal data.",
        requirement="Ensure appropriate security of the personal data.",
        implementation="ZTA enforcement, encryption at rest, and RLS isolation.",
        evidence_source="audit_log",
        automated=True,
        severity="critical"
    ),
    FrameworkControl(
        control_id="GDPR-Art.6",
        framework="GDPR",
        category="Lawfulness",
        title="Lawfulness of processing",
        description="Processing is lawful only if consent or other basis applies.",
        requirement="Ensure consent or other lawful basis.",
        implementation="Consent registry integrated for all access operations.",
        evidence_source="consent_registry",
        automated=True,
        severity="critical"
    )
]
