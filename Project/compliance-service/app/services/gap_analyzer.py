"""
Gap Analyzer Service.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from datetime import datetime, timezone

from app.services.control_mapper import ControlMapper, FRAMEWORKS
from app.models.gap import GapReport, RemediationItem
from app.models.control import FrameworkControl

tracer = trace.get_tracer(__name__)

class GapAnalyzer:
    def __init__(self, session: AsyncSession):
        self.mapper = ControlMapper(session)

    async def analyze_framework(self, tenant_id: str, framework: str) -> GapReport:
        with tracer.start_as_current_span("compliance.gap.analyze"):
            controls = await self.mapper.get_framework_controls(framework)
            
            implemented = 0
            critical_gaps = []
            remediation_roadmap = []
            
            for ctrl in controls:
                satisfied = await self.mapper.evaluate_control(tenant_id, ctrl)
                if satisfied:
                    implemented += 1
                else:
                    critical_gaps.append(ctrl)
                    remediation_roadmap.append(RemediationItem(
                        control_id=ctrl.control_id,
                        recommendation=f"Implement {ctrl.title} via {ctrl.implementation}"
                    ))
                    
            total = len(controls)
            pct = (implemented / total * 100) if total > 0 else 100.0
            
            return GapReport(
                framework=framework,
                tenant_id=tenant_id,
                analysis_date=datetime.now(timezone.utc).isoformat(),
                total_controls=total,
                implemented=implemented,
                partial=0,
                not_implemented=len(critical_gaps),
                not_applicable=0,
                compliance_percentage=pct,
                critical_gaps=critical_gaps,
                remediation_roadmap=remediation_roadmap
            )

    async def analyze_all(self, tenant_id: str) -> List[GapReport]:
        reports = []
        for fw in FRAMEWORKS.keys():
            report = await self.analyze_framework(tenant_id, fw)
            reports.append(report)
        return reports
