"""
DISHA Framework Controls.
"""
from app.models.control import FrameworkControl

DISHA_CONTROLS = [
    FrameworkControl(
        control_id="DISHA-Ch4.1",
        framework="DISHA",
        category="Data Protection",
        title="Consent for Health Data",
        description="Digital health data shall be collected only with owner consent.",
        requirement="Obtain consent before collecting digital health data.",
        implementation="consent-service enforces explicit opt_in.",
        evidence_source="consent_registry",
        automated=True,
        severity="critical"
    )
]
