"""
MedTrustX Knowledge Graph Engine Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.graph import GraphEdge, GraphNode, GraphQuery, InferenceResult
from src.schemas.graph import EdgeCreate, GraphQueryRequest, GraphQueryResponse, NodeCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Nodes & Edges ──

async def create_node(session: AsyncSession, tenant_id: uuid.UUID, data: NodeCreate) -> GraphNode:
    node = GraphNode(tenant_id=tenant_id, entity_type=data.entity_type, properties=data.properties)
    session.add(node)
    await session.flush()
    await publish_event("GRAPH_UPDATED", tenant_id, node.id, {"action": "node_created", "type": data.entity_type})
    return node


async def create_edge(session: AsyncSession, tenant_id: uuid.UUID, data: EdgeCreate) -> GraphEdge:
    edge = GraphEdge(tenant_id=tenant_id, source_node=data.source_node, target_node=data.target_node, relation_type=data.relation_type, properties=data.properties)
    session.add(edge)
    await session.flush()
    await publish_event("GRAPH_UPDATED", tenant_id, edge.id, {"action": "edge_created", "type": data.relation_type})
    return edge


async def get_node(session: AsyncSession, tenant_id: uuid.UUID, node_id: uuid.UUID) -> GraphNode | None:
    result = await session.execute(select(GraphNode).where(and_(GraphNode.id == node_id, GraphNode.tenant_id == tenant_id, GraphNode.deleted_at.is_(None))))
    return result.scalar_one_or_none()


# ── Query & Inference ──

async def execute_query(session: AsyncSession, tenant_id: uuid.UUID, req: GraphQueryRequest) -> GraphQueryResponse:
    # Simulating a complex graph traversal
    simulated_result = [{"node": str(uuid.uuid4()), "degree": 2}, {"node": str(uuid.uuid4()), "degree": 3}]
    
    query_log = GraphQuery(tenant_id=tenant_id, query=req.query, result_count=len(simulated_result))
    session.add(query_log)
    await session.flush()
    
    return GraphQueryResponse(query=req.query, result_count=len(simulated_result), data=simulated_result, executed_at=query_log.executed_at)


async def list_inference(session: AsyncSession, tenant_id: uuid.UUID) -> List[InferenceResult]:
    result = await session.execute(select(InferenceResult).where(and_(InferenceResult.tenant_id == tenant_id, InferenceResult.deleted_at.is_(None))).order_by(InferenceResult.created_at.desc()).limit(100))
    return list(result.scalars().all())
