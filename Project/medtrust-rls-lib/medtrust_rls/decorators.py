"""
Decorators for RLS operations and Privileged Access Management.

Provides @require_tenant and @privileged_access decorators.
"""

import os
from functools import wraps
from typing import Any, Callable

from medtrust_rls.context import get_tenant_context, set_tenant_context
from medtrust_rls.exceptions import BypassDenied, RLSContextMissingError

def require_tenant() -> Callable:
    """
    Decorator to ensure that a valid TenantContext is set before execution.
    Raises RLSContextMissingError if missing.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            context = get_tenant_context()
            if not context:
                raise RLSContextMissingError()
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def privileged_access(reason: str) -> Callable:
    """
    Decorator to activate Privileged Access Management (PAM) bypass.
    
    1. Checks if the user has the 'superadmin' role.
    2. Checks Redis for an approved PAM session key.
    3. If approved, sets is_privileged=True in the TenantContext.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            context = get_tenant_context()
            if not context:
                raise RLSContextMissingError()
                
            if context.role != "superadmin":
                raise BypassDenied(
                    user_id=str(context.user_id),
                    reason="User does not have superadmin role"
                )
            
            try:
                from redis.asyncio import Redis
                redis_url = os.getenv("REDIS_URL", "redis://medtrust-redis:6379")
                redis_client = Redis.from_url(redis_url)
                
                # If target tenant is in kwargs, use it. Otherwise use current context tenant
                target_tenant_id = str(kwargs.get("tenant_id", context.tenant_id))
                
                key = f"medtrust:pam:approved:{str(context.user_id)}:{target_tenant_id}"
                exists = await redis_client.exists(key)
                
                if not exists:
                    raise BypassDenied(
                        user_id=str(context.user_id),
                        reason=f"No approved PAM session found for tenant {target_tenant_id}"
                    )
                
                # Update context to privileged
                set_tenant_context(
                    tenant_id=context.tenant_id,
                    user_id=context.user_id,
                    role=context.role,
                    is_privileged=True,
                    bypass_reason=reason
                )
                
                # Execute function
                result = await func(*args, **kwargs)
                
                return result
                
            finally:
                if 'redis_client' in locals():
                    await redis_client.aclose()
                    
        return wrapper
    return decorator
