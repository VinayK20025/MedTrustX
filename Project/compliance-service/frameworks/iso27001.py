"""
ISO 27001 Framework Controls.
"""
from app.models.control import FrameworkControl

ISO27001_CONTROLS = [
    FrameworkControl(
        control_id="ISO27001-A.5.15",
        framework="ISO 27001:2022",
        category="Access Control",
        title="Access Control",
        description="Rules to control physical and logical access.",
        requirement="Access to information and other associated assets shall be controlled.",
        implementation="RBAC and ZTA PDP/PEP models applied to all requests.",
        evidence_source="audit_log",
        automated=True,
        severity="high"
    ),
    FrameworkControl(
        control_id="ISO27001-A.8.15",
        framework="ISO 27001:2022",
        category="Logging",
        title="Logging",
        description="Logs recording activities, exceptions, faults and information security events.",
        requirement="Logs shall be produced, kept, and protected.",
        implementation="Immutable hash chain audit log in audit-service.",
        evidence_source="audit_log",
        automated=True,
        severity="high"
    )
]
