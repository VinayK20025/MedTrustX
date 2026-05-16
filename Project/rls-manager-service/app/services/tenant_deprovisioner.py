"""
Tenant Deprovisioner Service.
"""
from typing import Any, Dict
from uuid import UUID

from sqlalchemy import text
from redis.asyncio import Redis
from opentelemetry import trace

from app.db.sessions import get_raw_session
from app.db.repositories.tenant_repo import TenantRepository
from medtrust_rls.bypass import PAMBypassManager

tracer = trace.get_tracer(__name__)

class TenantDeprovisioner:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.pam_manager = PAMBypassManager(redis_client)

    async def offboard(self, tenant_id: UUID, purge_data: bool, offboarded_by: UUID, reason: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("rls.tenant.offboard") as span:
            span.set_attribute("tenant_id", str(tenant_id))
            span.set_attribute("purge_data", purge_data)
            
            clinical_session = await get_raw_session("clinical")
            repo = TenantRepository(clinical_session)
            record = await repo.get_by_id(tenant_id)
            if not record:
                await clinical_session.close()
                raise ValueError("Tenant not found")
            tenant_slug = record.tenant_slug
            await clinical_session.close()

            cursor = b"0"
            pattern = f"medtrust:pam:approved:*:{tenant_id}"
            while cursor:
                cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
                if keys:
                    await self.redis.delete(*keys)

            stats = {}

            if purge_data:
                deletion_plan = {
                    "clinical": [
                        "careplans", "procedures", "allergies", "medications", 
                        "conditions", "observations", "encounters", "patients"
                    ],
                    "operational": [
                        "access_review_snapshots", "consent_registry", "appointments"
                    ],
                    "iam": [
                        "auth_logs", "sessions", "user_roles", "users", "devices"
                    ],
                    "analytics": [
                        "readmission_risk", "patient_conditions", "patient_vitals"
                    ]
                }
                
                for db_name, tables in deletion_plan.items():
                    session = await get_raw_session(db_name)
                    try:
                        db_stats = {}
                        for table in tables:
                            stmt = text(f"DELETE FROM {table} WHERE tenant_id = :tid")
                            res = await session.execute(stmt, {"tid": str(tenant_id)})
                            db_stats[table] = res.rowcount
                        await session.commit()
                        stats[db_name] = db_stats
                    except Exception as e:
                        await session.rollback()
                        stats[db_name] = f"Error: {str(e)}"
                    finally:
                        await session.close()

            for db_name in ["clinical", "operational", "iam", "analytics"]:
                session = await get_raw_session(db_name)
                try:
                    stmt = text("""
                        UPDATE tenant_registry 
                        SET status = 'offboarded', offboarded_at = NOW() 
                        WHERE tenant_id = :tid
                    """)
                    await session.execute(stmt, {"tid": str(tenant_id)})
                    await session.commit()
                except Exception:
                    await session.rollback()
                finally:
                    await session.close()

            await self.redis.delete(f"medtrust:{tenant_slug}:status")

            clinical_session = await get_raw_session("clinical")
            try:
                audit_stmt = text("""
                    INSERT INTO audit_log (
                        id, timestamp, user_id, tenant_id, target_tenant_id, 
                        endpoint, query_attempted, source_ip, action_taken, severity
                    ) VALUES (
                        gen_random_uuid(), NOW(), :uid, :tid, :tid, 'tenant_deprovisioner', :reason, '127.0.0.1', 'allowed_privileged', 'high'
                    )
                """)
                await clinical_session.execute(audit_stmt, {
                    "uid": str(offboarded_by), "tid": str(tenant_id), "reason": f"OFFBOARD: {reason}"
                })
                await clinical_session.commit()
            except Exception:
                await clinical_session.rollback()
            finally:
                await clinical_session.close()

            return {
                "tenant_id": str(tenant_id),
                "status": "offboarded",
                "purge_stats": stats
            }
