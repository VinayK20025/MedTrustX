"""
MedTrustX SonarQube Quality Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.sonarqube import (
    AnalysisCreate, AnalysisResponse, CodeIssueResponse,
    ProjectCreate, ProjectResponse, QualityGateResponse
)
from src.services import quality_service

router = APIRouter(tags=["SonarQube Quality Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Projects ──

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(data: ProjectCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    project = await quality_service.create_project(session, tid, data)
    await session.commit()
    return project


@router.get("/projects/{id}", response_model=ProjectResponse)
async def get_project(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    project = await quality_service.get_project(session, tid, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# ── Analysis ──

@router.post("/analysis", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def run_analysis(data: AnalysisCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    analysis = await quality_service.run_analysis(session, tid, data)
    await session.commit()
    return analysis


# ── Issues ──

@router.get("/projects/{id}/issues", response_model=List[CodeIssueResponse])
async def get_project_issues(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await quality_service.get_project_issues(session, tid, id)


# ── Quality Gates ──

@router.get("/quality-gates/{project_id}", response_model=QualityGateResponse)
async def get_quality_gate(project_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    gate = await quality_service.get_quality_gate(session, tid, project_id)
    if not gate:
        raise HTTPException(status_code=404, detail="Quality gate not found")
    return gate
