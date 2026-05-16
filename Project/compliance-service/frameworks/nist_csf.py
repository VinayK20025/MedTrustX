"""
NIST CSF 2.0 Framework Controls.
"""
from app.models.control import FrameworkControl

NIST_CSF_CONTROLS = [
    FrameworkControl(
        control_id="NIST-CSF-PR.AC-1",
        framework="NIST CSF 2.0",
        category="Protect",
        title="Identity Management",
        description="Identities and credentials are managed.",
        requirement="Manage identities and credentials.",
        implementation="Keycloak + IAM service handle identity.",
        evidence_source="audit_log",
        automated=True,
        severity="high"
    )
]
