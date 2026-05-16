"""
MedTrustX Data Fabric / Integration Hub Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.fabric import IntegrationEventResponse, PipelineCreate, PipelineResponse, SchemaResponse, TransformationCreate, TransformationResponse
from src.services import fabric_service

router = APIRouter(tags=["Data Fabric / Integration Hub Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/pipelines", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
async def create_pipeline(data: PipelineCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pipeline = await fabric_service.create_pipeline(session, tid, data)
    await session.commit()
    return pipeline

@router.get("/pipelines/{id}", response_model=PipelineResponse)
async def get_pipeline(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pipeline = await fabric_service.get_pipeline(session, tid, id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.post("/transformations", response_model=TransformationResponse, status_code=status.HTTP_201_CREATED)
async def create_transformation(data: TransformationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    transform = await fabric_service.create_transformation(session, tid, data)
    await session.commit()
    return transform

@router.get("/schemas", response_model=List[SchemaResponse])
async def list_schemas(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await fabric_service.list_schemas(session, tid)

@router.get("/events", response_model=List[IntegrationEventResponse])
async def list_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await fabric_service.list_events(session, tid)
