# MedTrustX — OPA RBAC Policy
# Role-Based Access Control using flattened permissions from Keycloak JWT

package medtrust.authz.rbac

import rego.v1

default allow := false

# The JWT token will contain client-specific permissions (e.g., "clinical.read")
# We assume the API gateway passes these permissions to OPA via input.user.permissions
# or input.permissions.

# Allow if the user has the explicit permission required for this resource and action
allow if {
    some permission in input.user.permissions
    permission == input.required_permission
}

# Allow if the user has a wildcard permission for the domain
allow if {
    some permission in input.user.permissions
    startswith(permission, concat(".", [input.domain, "read_all"]))
    input.action == "read"
}

allow if {
    some permission in input.user.permissions
    startswith(permission, concat(".", [input.domain, "full_access"]))
}

# Super admin bypass
allow if {
    "SUPER_ADMIN" in input.user.roles
}

# Department-scoped access
department_match if {
    input.user.department == input.resource.department
}

# Break-glass emergency access (logged + alerted)
allow if {
    input.emergency == true
    "EMERGENCY_ACCESS" in input.user.roles
}
