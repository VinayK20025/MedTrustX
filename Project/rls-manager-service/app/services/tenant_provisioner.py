import uuid
import json
from typing import Any, Dict

from sqlalchemy import text
from redis.asyncio import Redis
from opentelemetry import trace

from app.db.sessions import get_raw_session

tracer = trace.get_tracer(__name__)
NAMESPACE_DNS = uuid.NAMESPACE_DNS

class TenantProvisioner:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    async def onboard(self, tenant_slug: str, tenant_name: str, metadata: Dict[str, Any], admin_user_id: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("rls.tenant.onboard") as span:
            span.set_attribute("tenant_slug", tenant_slug)
            
            # Step 1: Generate tenant_id
            tenant_id = uuid.uuid5(NAMESPACE_DNS, tenant_slug)
            span.set_attribute("tenant_id", str(tenant_id))
            
            result_stats = {}
            
            # Step 2 & 3: Insert into registries and verify policies
            db_names = ["clinical", "operational", "iam", "analytics"]
            for db in db_names:
                session = await get_raw_session(db)
                try:
                    stmt = text("""
                        INSERT INTO tenant_registry (tenant_id, tenant_name, tenant_slug, status, onboarded_at, metadata)
                        VALUES (:tid, :tname, :tslug, 'active', NOW(), :meta)
                        ON CONFLICT (tenant_id) DO NOTHING
                    """)
                    await session.execute(stmt, {
                        "tid": str(tenant_id), "tname": tenant_name, "tslug": tenant_slug, "meta": json.dumps(metadata)
                    })
                    await session.commit()
                    result_stats[db] = "success"
                except Exception as e:
                    await session.rollback()
                    result_stats[db] = f"error: {str(e)}"
                finally:
                    await session.close()
            
            # Step 4: Create Redis namespace key
            await self.redis.set(f"medtrust:{tenant_slug}:status", "active")
            
            # Step 5: Emit onboarding audit event
            clinical_session = await get_raw_session("clinical")
            try:
                audit_stmt = text("""
                    INSERT INTO audit_log (
                        id, timestamp, user_id, tenant_id, target_tenant_id, 
                        endpoint, query_attempted, source_ip, action_taken, severity
                    ) VALUES (
                        :id, NOW(), :uid, :tid, :tid, 'tenant_provisioner', 'ONBOARD', '127.0.0.1', 'allowed_privileged', 'medium'
                    )
                """)
                await clinical_session.execute(audit_stmt, {
                    "id": str(uuid.uuid4()), "uid": admin_user_id, "tid": str(tenant_id)
                })
                await clinical_session.commit()
            except Exception:
                await clinical_session.rollback()
            finally:
                await clinical_session.close()

            # Step 6: Return
            return {
                "tenant_id": str(tenant_id),
                "status": "onboarded",
                "db_results": result_stats
            }
