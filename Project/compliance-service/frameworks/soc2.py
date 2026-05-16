"""
SOC 2 Framework Controls.
"""
from app.models.control import FrameworkControl

SOC2_CONTROLS = [
    FrameworkControl(
        control_id="SOC2-CC6.1",
        framework="SOC 2 Type II",
        category="Logical Access",
        title="Logical Access Security",
        description="Logical access to systems is restricted.",
        requirement="Restrict logical access to systems.",
        implementation="ZTA continuously verifies trust score and JWT integrity.",
        evidence_source="audit_log",
        automated=True,
        severity="critical"
    )
]
