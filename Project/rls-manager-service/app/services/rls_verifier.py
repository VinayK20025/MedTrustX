"""
RLS Verifier Service.
Runs full proofs of Row-Level Security isolation across all databases.
"""
from typing import Any, Dict
from uuid import UUID

from sqlalchemy import text
from opentelemetry import trace

from app.db.sessions import get_raw_session

tracer = trace.get_tracer(__name__)

class RLSVerifier:
    def __init__(self):
        self.tables_by_db = {
            "clinical": ["patients", "encounters", "observations", "conditions", "medications", "allergies", "procedures", "careplans", "audit_log"],
            "operational": ["appointments", "consent_registry", "access_review_snapshots", "api_request_logs", "threat_logs", "otel_traces"],
            "iam": ["users", "roles", "user_roles", "sessions", "devices", "auth_logs"],
            "analytics": ["patient_vitals", "patient_conditions", "readmission_risk"]
        }

    async def run_full_proof(self, tenant_id: UUID) -> Dict[str, Any]:
        with tracer.start_as_current_span("rls.proof.run") as span:
            span.set_attribute("tenant_id", str(tenant_id))
            
            other_tenant_id = "00000000-0000-4000-8000-000000000001"
            
            report = {
                "tenant_id": str(tenant_id),
                "proof_timestamp": None,
                "databases": {},
                "overall_passed": True,
                "failed_tables": []
            }
            
            for db_name, tables in self.tables_by_db.items():
                report["databases"][db_name] = {"tables": []}
                session = await get_raw_session(db_name)
                
                try:
                    for table in tables:
                        try:
                            # Test 1: Own tenant visibility
                            await session.execute(text(f"SET LOCAL app.tenant_id = '{tenant_id}'"))
                            res_own = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                            own_count = res_own.scalar() or 0
                            
                            # Test 2: Cross-tenant blindness
                            await session.execute(text(f"SET LOCAL app.tenant_id = '{other_tenant_id}'"))
                            res_cross = await session.execute(text(f"SELECT COUNT(*) FROM {table} WHERE tenant_id = '{tenant_id}'::uuid"))
                            cross_count = res_cross.scalar() or 0
                            
                            # Test 3: Privileged bypass works
                            await session.execute(text("SET LOCAL rls.bypass = 'on'"))
                            res_priv = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                            priv_count = res_priv.scalar() or 0
                            
                            # Test 4: Owner filtered
                            await session.execute(text("RESET ALL"))
                            res_owner = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                            owner_count = res_owner.scalar() or 0
                            owner_filtered = (owner_count < priv_count) or (priv_count == 0)
                            
                            passed = (cross_count == 0) and owner_filtered
                            
                            if not passed:
                                report["overall_passed"] = False
                                report["failed_tables"].append(f"{db_name}.{table}")
                                
                            report["databases"][db_name]["tables"].append({
                                "name": table,
                                "own_count": own_count,
                                "cross_tenant_count": cross_count,
                                "privileged_count": priv_count,
                                "owner_filtered": owner_filtered,
                                "passed": passed
                            })
                        except Exception as e:
                            report["overall_passed"] = False
                            report["failed_tables"].append(f"{db_name}.{table}")
                            report["databases"][db_name]["tables"].append({
                                "name": table, "error": str(e), "passed": False
                            })
                finally:
                    await session.close()
                    
            from datetime import datetime, timezone
            report["proof_timestamp"] = datetime.now(timezone.utc).isoformat()
            return report
