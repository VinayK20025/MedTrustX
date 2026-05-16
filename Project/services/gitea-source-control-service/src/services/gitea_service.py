"""
MedTrustX Gitea Source Control Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.gitea import Commit, Issue, PullRequest, Repository
from src.schemas.gitea import (
    CommitCreate, PullRequestCreate, RepoCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Repositories ──

async def create_repository(
    session: AsyncSession, tenant_id: uuid.UUID, data: RepoCreate
) -> Repository:
    repo = Repository(
        tenant_id=tenant_id,
        name=data.name,
        owner_id=data.owner_id,
        is_private=data.is_private
    )
    session.add(repo)
    await session.flush()
    await publish_event("REPO_CREATED", tenant_id, repo.id, {"name": repo.name})
    return repo


async def get_repository(
    session: AsyncSession, tenant_id: uuid.UUID, repo_id: uuid.UUID
) -> Repository | None:
    result = await session.execute(
        select(Repository).where(
            and_(Repository.id == repo_id, Repository.tenant_id == tenant_id, Repository.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Commits ──

async def add_commit(
    session: AsyncSession, tenant_id: uuid.UUID, repo_id: uuid.UUID, data: CommitCreate
) -> Commit:
    commit = Commit(
        tenant_id=tenant_id,
        repo_id=repo_id,
        commit_hash=data.commit_hash,
        author_id=data.author_id,
        message=data.message
    )
    session.add(commit)
    await session.flush()
    await publish_event("COMMIT_PUSHED", tenant_id, commit.id, {"repo_id": str(repo_id), "hash": data.commit_hash})
    return commit


# ── Pull Requests ──

async def create_pull_request(
    session: AsyncSession, tenant_id: uuid.UUID, repo_id: uuid.UUID, data: PullRequestCreate
) -> PullRequest:
    pr = PullRequest(
        tenant_id=tenant_id,
        repo_id=repo_id,
        source_branch=data.source_branch,
        target_branch=data.target_branch,
        status="open"
    )
    session.add(pr)
    await session.flush()
    await publish_event("PULL_REQUEST_CREATED", tenant_id, pr.id, {"repo_id": str(repo_id)})
    return pr


# ── Issues ──

async def get_issues(
    session: AsyncSession, tenant_id: uuid.UUID, repo_id: uuid.UUID
) -> List[Issue]:
    result = await session.execute(
        select(Issue).where(
            and_(Issue.tenant_id == tenant_id, Issue.repo_id == repo_id, Issue.deleted_at.is_(None))
        ).order_by(Issue.created_at.desc())
    )
    return list(result.scalars().all())
