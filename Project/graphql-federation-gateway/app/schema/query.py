"""
GraphQL Queries.
"""
import strawberry
from app.schema.patient.types import PatientDashboardData
from app.schema.clinical.types import ClinicalSummaryData
from app.schema.admin.types import AdminOverviewData

from app.resolvers.patient_resolver import resolve_patient_dashboard
from app.resolvers.clinical_resolver import resolve_clinical_summary
from app.resolvers.admin_resolver import resolve_admin_overview

@strawberry.type
class Query:
    @strawberry.field
    async def patient_dashboard(self, patient_id: str, info: strawberry.Info) -> PatientDashboardData:
        return await resolve_patient_dashboard(patient_id, info)
        
    @strawberry.field
    async def clinical_summary(self, patient_id: str, info: strawberry.Info) -> ClinicalSummaryData:
        return await resolve_clinical_summary(patient_id, info)

    @strawberry.field
    async def admin_overview(self, tenant_id: str, info: strawberry.Info) -> AdminOverviewData:
        return await resolve_admin_overview(tenant_id, info)
