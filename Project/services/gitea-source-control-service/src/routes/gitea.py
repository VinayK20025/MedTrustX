"""
MedTrustX Gitea Source Control Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.gitea import (
    CommitCreate, CommitResponse, IssueResponse,
    PullRequestCreate, PullRequestResponse, RepoCreate, RepoResponse
)
from src.services import gitea_service

router = APIRouter(tags=["Gitea Source Control Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Repositories ──

@router.post("/repos", response_model=RepoResponse, status_code=status.HTTP_201_CREATED)
async def create_repository(data: RepoCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    repo = await gitea_service.create_repository(session, tid, data)
    await session.commit()
    return repo


@router.get("/repos/{id}", response_model=RepoResponse)
async def get_repository(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    repo = await gitea_service.get_repository(session, tid, id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo


# ── Commits ──

@router.post("/repos/{id}/commits", response_model=CommitResponse, status_code=status.HTTP_201_CREATED)
async def add_commit(id: uuid.UUID, data: CommitCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    commit = await gitea_service.add_commit(session, tid, id, data)
    await session.commit()
    return commit


# ── Pull Requests ──

@router.post("/repos/{id}/pull-requests", response_model=PullRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_pull_request(id: uuid.UUID, data: PullRequestCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    pr = await gitea_service.create_pull_request(session, tid, id, data)
    await session.commit()
    return pr


# ── Issues ──

@router.get("/repos/{id}/issues", response_model=List[IssueResponse])
async def get_issues(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await gitea_service.get_issues(session, tid, id)
