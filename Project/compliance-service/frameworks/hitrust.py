"""
HITRUST CSF Framework Controls.
"""
from app.models.control import FrameworkControl

HITRUST_CONTROLS = [
    FrameworkControl(
        control_id="HITRUST-01.01",
        framework="HITRUST CSF",
        category="Access Control",
        title="Access Control Policy",
        description="Access control policy is established and reviewed.",
        requirement="Establish access control policy.",
        implementation="IAM service and ZTA enforce continuous access review.",
        evidence_source="access_review_snapshots",
        automated=True,
        severity="high"
    )
]
