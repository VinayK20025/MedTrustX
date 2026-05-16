"""
Admin Resolvers.
"""
from strawberry.types import Info
from app.services.composition_client import CompositionClient
from app.schema.admin.types import AdminOverviewData, IamStat, ComplianceStat

async def resolve_admin_overview(tenant_id: str, info: Info) -> AdminOverviewData:
    user = info.context.get("user")
    if not user:
        raise Exception("Unauthorized")
        
    if "IT_Admin" not in user.get("roles", []) and "superadmin" not in user.get("roles", []):
        raise Exception("Forbidden")
        
    client = CompositionClient(user["token"])
    data = await client.get_admin_overview(tenant_id)
    
    iam = data.get("iam", {})
    iam_stats = [IamStat(metric=k, value=v) for k, v in iam.items()]
    
    comp = data.get("compliance", {}).get("frameworks", [])
    comp_stats = [ComplianceStat(framework=f["name"], score=f["score"]) for f in comp]
    
    threats = data.get("zta", {}).get("active_threats", 0)
    
    return AdminOverviewData(
        iam_stats=iam_stats,
        compliance_scores=comp_stats,
        active_threats=threats
    )
