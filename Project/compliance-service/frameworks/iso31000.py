"""
ISO 31000 Framework Controls.
"""
from app.models.control import FrameworkControl

ISO31000_CONTROLS = [
    FrameworkControl(
        control_id="ISO31000-Step.2",
        framework="ISO 31000:2018",
        category="Risk Assessment",
        title="Risk Identification",
        description="Identify risks that might help or prevent achieving objectives.",
        requirement="Systematically identify risks.",
        implementation="Automated breach detection and gap analysis populate the risk register.",
        evidence_source="risk_register",
        automated=True,
        severity="medium"
    ),
    FrameworkControl(
        control_id="ISO31000-Step.4",
        framework="ISO 31000:2018",
        category="Risk Assessment",
        title="Risk Treatment",
        description="Select and implement risk treatment options.",
        requirement="Formulate and select options for risk treatment.",
        implementation="Risks tracked and remediated via compliance-service risk module.",
        evidence_source="risk_register",
        automated=True,
        severity="high"
    )
]
