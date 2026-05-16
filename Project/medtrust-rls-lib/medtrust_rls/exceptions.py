"""
Exceptions module for MedTrustX RLS Library.

Defines custom exceptions for tenant isolation violations and bypass denials.
"""

from typing import Any, Dict, Optional

class MedTrustRLSError(Exception):
    """Base class for all RLS-related exceptions in MedTrustX."""
    
    def __init__(self, message: str, status_code: int = 500, title: str = "RLS Error"):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.title = title

    def to_problem_detail(self) -> Dict[str, Any]:
        """Convert exception to RFC 7807 Problem Details format."""
        type_suffix = self.__class__.__name__.lower().replace("error", "-error")
        return {
            "type": f"https://medtrustx.hospital/errors/{type_suffix}",
            "title": self.title,
            "status": self.status_code,
            "detail": self.message,
        }

class TenantViolationError(MedTrustRLSError):
    """Raised when a cross-tenant data access attempt is detected."""
    
    def __init__(self, user_id: str, tenant_id: str, target_tenant_id: Optional[str] = None):
        msg = f"User {user_id} of tenant {tenant_id} attempted cross-tenant access"
        if target_tenant_id:
            msg += f" to {target_tenant_id}"
        super().__init__(message=msg, status_code=403, title="Tenant Isolation Violation")
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.target_tenant_id = target_tenant_id

class BypassDenied(MedTrustRLSError):
    """Raised when Privileged Access Management bypass is denied or invalid."""
    
    def __init__(self, user_id: str, reason: str):
        msg = f"PAM bypass denied for user {user_id}: {reason}"
        super().__init__(message=msg, status_code=403, title="PAM Bypass Denied")
        self.user_id = user_id
        self.reason = reason

class TenantNotFoundError(MedTrustRLSError):
    """Raised when a tenant UUID cannot be found in the registry."""
    
    def __init__(self, tenant_id: str):
        msg = f"Tenant {tenant_id} not found or offboarded"
        super().__init__(message=msg, status_code=404, title="Tenant Not Found")
        self.tenant_id = tenant_id

class RLSContextMissingError(MedTrustRLSError):
    """Raised when RLS context is missing but required for an operation."""
    
    def __init__(self):
        msg = "RLS TenantContext is missing from the current execution context"
        super().__init__(message=msg, status_code=500, title="RLS Context Missing")
