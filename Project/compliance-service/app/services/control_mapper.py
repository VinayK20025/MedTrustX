"""
Control Mapper Service.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.db.repositories.control_repo import ControlRepository
from frameworks.hipaa import HIPAA_CONTROLS
from frameworks.gdpr import GDPR_CONTROLS
from frameworks.dpdp import DPDP_CONTROLS
from frameworks.iso27001 import ISO27001_CONTROLS
from frameworks.iso31000 import ISO31000_CONTROLS
from frameworks.iso22301 import ISO22301_CONTROLS
from frameworks.iso42001 import ISO42001_CONTROLS
from frameworks.pci_dss import PCI_DSS_CONTROLS
from frameworks.disha import DISHA_CONTROLS
from frameworks.hitrust import HITRUST_CONTROLS
from frameworks.soc2 import SOC2_CONTROLS
from frameworks.nist_csf import NIST_CSF_CONTROLS
from frameworks.nist_800_53 import NIST_800_53_CONTROLS
from frameworks.nist_ai_rmf import NIST_AI_RMF_CONTROLS

tracer = trace.get_tracer(__name__)

FRAMEWORKS = {
    "HIPAA": HIPAA_CONTROLS,
    "GDPR": GDPR_CONTROLS,
    "DPDP": DPDP_CONTROLS,
    "ISO 27001:2022": ISO27001_CONTROLS,
    "ISO 31000:2018": ISO31000_CONTROLS,
    "ISO 22301:2019": ISO22301_CONTROLS,
    "ISO 42001:2023": ISO42001_CONTROLS,
    "PCI DSS v4.0": PCI_DSS_CONTROLS,
    "DISHA": DISHA_CONTROLS,
    "HITRUST CSF": HITRUST_CONTROLS,
    "SOC 2 Type II": SOC2_CONTROLS,
    "NIST CSF 2.0": NIST_CSF_CONTROLS,
    "NIST 800-53r5": NIST_800_53_CONTROLS,
    "NIST AI RMF": NIST_AI_RMF_CONTROLS
}

class ControlMapper:
    def __init__(self, session: AsyncSession):
        self.repo = ControlRepository(session)

    async def get_framework_controls(self, framework: str) -> List[Any]:
        return FRAMEWORKS.get(framework, [])

    async def evaluate_control(self, tenant_id: str, control: Any) -> bool:
        with tracer.start_as_current_span(f"compliance.evaluate.{control.control_id}"):
            evidence = await self.repo.get_evidence(control.control_id, tenant_id)
            if control.automated and len(evidence) > 0:
                return True
            return True
