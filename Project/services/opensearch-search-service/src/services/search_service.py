"""
MedTrustX OpenSearch Search Service — Business Logic Layer
"""
import uuid
import json
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.opensearch import IndexedDocument, SearchIndex, SearchQuery
from src.schemas.opensearch import (
    DocumentCreate, DocumentResponse, IndexCreate, SearchQueryRequest, SearchQueryResponse
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Indexes ──

async def create_index(
    session: AsyncSession, tenant_id: uuid.UUID, data: IndexCreate
) -> SearchIndex:
    idx = SearchIndex(
        tenant_id=tenant_id,
        index_name=data.index_name,
        mappings=data.mappings
    )
    session.add(idx)
    await session.flush()
    return idx


async def get_index(
    session: AsyncSession, tenant_id: uuid.UUID, index_name: str
) -> SearchIndex | None:
    result = await session.execute(
        select(SearchIndex).where(
            and_(SearchIndex.tenant_id == tenant_id, SearchIndex.index_name == index_name, SearchIndex.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Documents ──

async def index_document(
    session: AsyncSession, tenant_id: uuid.UUID, data: DocumentCreate
) -> DocumentResponse:
    doc = IndexedDocument(
        tenant_id=tenant_id,
        index_name=data.index_name,
        document=data.document
    )
    session.add(doc)
    await session.flush()
    
    await publish_event("DOCUMENT_INDEXED", tenant_id, doc.id, {"index_name": data.index_name})
    
    return DocumentResponse(
        id=doc.id,
        index_name=doc.index_name,
        document=doc.document,
        created_at=doc.created_at
    )


# ── Search ──

async def execute_search(
    session: AsyncSession, tenant_id: uuid.UUID, request: SearchQueryRequest
) -> SearchQueryResponse:
    # 1. Audit the query execution
    audit_query = SearchQuery(
        tenant_id=tenant_id,
        query=request.query
    )
    session.add(audit_query)

    # 2. Naive fallback search simulation
    # Real implementation would call OpenSearch REST API securely using `tenant_id` namespace
    query_text = request.query.lower()
    
    # Retrieve docs
    result = await session.execute(
        select(IndexedDocument).where(
            and_(IndexedDocument.tenant_id == tenant_id, IndexedDocument.index_name == request.index_name)
        ).limit(50)
    )
    all_docs = result.scalars().all()
    
    # Very basic substring matching on stringified JSON for simulation purposes
    matched = []
    for doc in all_docs:
        doc_str = json.dumps(doc.document).lower()
        if query_text in doc_str:
            matched.append(doc.document)

    audit_query.result_count = len(matched)
    await session.flush()
    
    await publish_event("SEARCH_EXECUTED", tenant_id, audit_query.id, {"query": request.query, "results": len(matched)})

    return SearchQueryResponse(
        query=request.query,
        result_count=len(matched),
        results=matched
    )
