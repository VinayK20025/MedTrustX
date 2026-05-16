"""
PCI DSS v4.0 Framework Controls.
"""
from app.models.control import FrameworkControl

PCI_DSS_CONTROLS = [
    FrameworkControl(
        control_id="PCI-DSS-10.2.1.1",
        framework="PCI DSS v4.0",
        category="Logging and Monitoring",
        title="Audit Logs",
        description="Audit logs capture all individual access to cardholder data.",
        requirement="Audit logs record all individual access to cardholder data.",
        implementation="All access to sensitive records is logged immutably via audit-service.",
        evidence_source="audit_log",
        automated=True,
        severity="critical"
    )
]
