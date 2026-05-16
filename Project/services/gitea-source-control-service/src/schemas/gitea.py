"""
MedTrustX Gitea Source Control Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Repositories ──

class RepoCreate(BaseModel):
    name: str
    owner_id: uuid.UUID
    is_private: bool = True


class RepoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    owner_id: uuid.UUID
    is_private: bool
    created_at: datetime


# ── Commits ──

class CommitCreate(BaseModel):
    commit_hash: str
    author_id: uuid.UUID
    message: str


class CommitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    repo_id: uuid.UUID
    commit_hash: str
    author_id: uuid.UUID
    message: str
    created_at: datetime


# ── Pull Requests ──

class PullRequestCreate(BaseModel):
    source_branch: str
    target_branch: str


class PullRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    repo_id: uuid.UUID
    source_branch: str
    target_branch: str
    status: str
    created_at: datetime


# ── Issues ──

class IssueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    repo_id: uuid.UUID
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
