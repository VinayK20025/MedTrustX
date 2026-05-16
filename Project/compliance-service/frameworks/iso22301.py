"""
ISO 22301 Framework Controls.
"""
from app.models.control import FrameworkControl

ISO22301_CONTROLS = [
    FrameworkControl(
        control_id="ISO22301-Clause.8.4",
        framework="ISO 22301:2019",
        category="Business Continuity",
        title="Business Continuity Plans",
        description="Establish documented business continuity procedures.",
        requirement="Implement business continuity plans.",
        implementation="Infrastructure HA, database replication, and fallback engine in ZTA.",
        evidence_source="audit_log",
        automated=False,
        severity="high"
    ),
    FrameworkControl(
        control_id="ISO22301-Clause.9.1",
        framework="ISO 22301:2019",
        category="Performance Evaluation",
        title="Monitoring and Measurement",
        description="Monitor performance of the BCMS.",
        requirement="Determine what needs to be monitored and measured.",
        implementation="Prometheus metrics and continuous audit logging capture availability data.",
        evidence_source="metrics",
        automated=True,
        severity="medium"
    )
]
