"""
RLS Violation model and publisher.

Handles the creation and dissemination of tenant isolation violation events.
Violations are published to Redis and optionally recorded to the audit log.
"""

import json
from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import UUID

from opentelemetry import trace
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

# Import optional redis. If not installed, publishing is a no-op
try:
    from redis.asyncio import Redis
except ImportError:
    Redis = None

tracer = trace.get_tracer(__name__)

class ViolationEvent(BaseModel):
    """
    Model representing an RLS violation or privileged access event.
    """
    model_config = ConfigDict(strict=True)

    violation_id: UUID
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    violating_user_id: UUID
    violating_tenant_id: UUID
    target_tenant_id: UUID
    endpoint: str
    query_attempted: str
    source_ip: str
    action_taken: Literal["blocked", "allowed_privileged"]
    severity: Literal["critical", "high", "medium"]

async def publish_violation(
    event: ViolationEvent, 
    redis_client: Optional['Redis'] = None,
    db_session: Optional[AsyncSession] = None
) -> None:
    """
    Publish a violation event to Redis, audit_log, and OpenTelemetry.
    
    1. INSERT into audit_log (patients_db) if db_session is provided
    2. PUBLISH to Redis channel medtrust:rls:violations if redis_client is provided
    3. Emit OpenTelemetry span: rls.violation.detected
    """
    with tracer.start_as_current_span("rls.violation.detected") as span:
        span.set_attribute("rls.violation.id", str(event.violation_id))
        span.set_attribute("rls.violating_user_id", str(event.violating_user_id))
        span.set_attribute("rls.violating_tenant_id", str(event.violating_tenant_id))
        span.set_attribute("rls.target_tenant_id", str(event.target_tenant_id))
        span.set_attribute("rls.action_taken", event.action_taken)
        span.set_attribute("rls.severity", event.severity)
        
        event_dict = event.model_dump()
        # Convert datetime and UUIDs to string for JSON serialization
        event_json = json.dumps(event_dict, default=str)
        
        if redis_client:
            await redis_client.publish("medtrust:rls:violations", event_json)
            
        if db_session:
            # Assuming db_session is connected to patients_db (clinical) where audit_log lives
            stmt = text("""
                INSERT INTO audit_log (
                    id, timestamp, user_id, tenant_id, target_tenant_id, 
                    endpoint, query_attempted, source_ip, action_taken, severity
                ) VALUES (
                    :violation_id, :timestamp, :violating_user_id, :violating_tenant_id, :target_tenant_id,
                    :endpoint, :query_attempted, :source_ip, :action_taken, :severity
                )
            """)
            await db_session.execute(stmt, {
                "violation_id": str(event.violation_id),
                "timestamp": event.timestamp,
                "violating_user_id": str(event.violating_user_id),
                "violating_tenant_id": str(event.violating_tenant_id),
                "target_tenant_id": str(event.target_tenant_id),
                "endpoint": event.endpoint,
                "query_attempted": event.query_attempted,
                "source_ip": event.source_ip,
                "action_taken": event.action_taken,
                "severity": event.severity
            })
