"""
NIST 800-53r5 Framework Controls.
"""
from app.models.control import FrameworkControl

NIST_800_53_CONTROLS = [
    FrameworkControl(
        control_id="NIST-800-53-AU-2",
        framework="NIST 800-53r5",
        category="Audit and Accountability",
        title="Event Logging",
        description="The organization identifies and logs events.",
        requirement="Identify and log events.",
        implementation="Audit service creates hash-chained logs.",
        evidence_source="audit_log",
        automated=True,
        severity="high"
    )
]
