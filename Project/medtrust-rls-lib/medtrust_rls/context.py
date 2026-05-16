"""
Tenant context management module.

Provides an async-safe TenantContext via contextvars to hold current tenant, user,
and PAM bypass state.
"""

from contextvars import ContextVar
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

@dataclass
class TenantContext:
    """Async-safe storage for current request's RLS context."""
    tenant_id: UUID
    user_id: UUID
    role: str
    is_privileged: bool = False
    bypass_reason: Optional[str] = None
    bypass_approved_by: Optional[UUID] = None
    session_id: str = ""

# The context variable. It's properly scoped per asyncio task/request.
_tenant_context_var: ContextVar[Optional[TenantContext]] = ContextVar("tenant_context", default=None)

def set_tenant_context(
    tenant_id: UUID, 
    user_id: UUID, 
    role: str, 
    is_privileged: bool = False,
    bypass_reason: Optional[str] = None,
    bypass_approved_by: Optional[UUID] = None,
    session_id: str = ""
) -> None:
    """
    Set the tenant context for the current async task/request.
    """
    context = TenantContext(
        tenant_id=tenant_id,
        user_id=user_id,
        role=role,
        is_privileged=is_privileged,
        bypass_reason=bypass_reason,
        bypass_approved_by=bypass_approved_by,
        session_id=session_id
    )
    _tenant_context_var.set(context)

def get_tenant_context() -> Optional[TenantContext]:
    """
    Retrieve the current tenant context. Returns None if not set.
    """
    return _tenant_context_var.get()

def clear_tenant_context() -> None:
    """
    Clear the tenant context for the current async task/request.
    """
    _tenant_context_var.set(None)
