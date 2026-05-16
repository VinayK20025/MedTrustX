"""
HIPAA Framework Controls.
"""
from app.models.control import FrameworkControl

HIPAA_CONTROLS = [
    FrameworkControl(
        control_id="HIPAA-164.312(a)(1)",
        framework="HIPAA",
        category="Access Control",
        title="Unique User Identification",
        description="Assign a unique name and/or number for identifying and tracking user identity.",
        requirement="Implement technical policies and procedures.",
        implementation="All users uniquely identified via Keycloak.",
        evidence_source="audit_log",
        automated=True,
        severity="critical"
    ),
    FrameworkControl(
        control_id="HIPAA-164.312(b)",
        framework="HIPAA",
        category="Audit Controls",
        title="Audit Controls",
        description="Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems.",
        requirement="Record and examine activity in information systems.",
        implementation="Immutable hash-chained audit log implemented.",
        evidence_source="audit_log",
        automated=True,
        severity="critical"
    )
]
