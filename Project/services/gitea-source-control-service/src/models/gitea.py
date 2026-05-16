"""
MedTrustX Gitea Source Control Service — Domain Entities

Postgres abstractions for Git repositories, commits, PRs, and issues.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Repository(BaseModel):
    """A tenant-scoped Git repository."""
    __tablename__ = "repositories"
    __table_args__ = (
        Index("ix_gitea_repo_tenant", "tenant_id", "name"),
        Index("ix_gitea_repo_owner", "owner_id"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    is_private: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Commit(BaseModel):
    """A single Git commit record linked to a repository."""
    __tablename__ = "commits"
    __table_args__ = (
        Index("ix_gitea_commit_repo", "tenant_id", "repo_id"),
    )

    repo_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    commit_hash: Mapped[str] = mapped_column(String(100), nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)


class PullRequest(BaseModel):
    """A pull/merge request between two branches in a repository."""
    __tablename__ = "pull_requests"
    __table_args__ = (
        Index("ix_gitea_pr_repo", "tenant_id", "repo_id"),
        Index("ix_gitea_pr_status", "status"),
    )

    repo_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    source_branch: Mapped[str] = mapped_column(String(100), nullable=False)
    target_branch: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, merged, closed


class Issue(BaseModel):
    """A bug/feature tracker issue linked to a repository."""
    __tablename__ = "issues"
    __table_args__ = (
        Index("ix_gitea_issue_repo", "tenant_id", "repo_id"),
        Index("ix_gitea_issue_status", "status"),
    )

    repo_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, closed
