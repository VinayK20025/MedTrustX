# MedTrustX — OPA ABAC Policy
# Attribute-Based Access Control with contextual evaluation

package medtrust.authz.abac

import rego.v1

default allow := false

# Time-based access (working hours check)
within_working_hours if {
    hour := time.clock(time.now_ns())[0]
    hour >= 6
    hour < 22
}

# After-hours access requires elevated role or break-glass
allow if {
    not within_working_hours
    "EMERGENCY_ACCESS" in input.user.roles
}

# PHI access requires specific clearance
allow if {
    input.resource.sensitivity == "PHI"
    "DOCTOR" in input.user.roles
    input.context.mfa_verified == true
}
allow if {
    input.resource.sensitivity == "PHI"
    "NURSE" in input.user.roles
    input.context.mfa_verified == true
}

# Patient can only access their own records
allow if {
    "PATIENT" in input.user.roles
    input.resource.type == "patient_record"
    input.resource.owner_id == input.user.id
    input.action == "read"
}

# Consent-based access
allow if {
    input.resource.sensitivity == "PHI"
    input.context.consent_granted == true
    input.action == "read"
}

# Assigned patient access
allow if {
    "DOCTOR" in input.user.roles
    input.resource.type == "patient_record"
    input.resource.owner_id in input.user.assigned_patients
}

allow if {
    "NURSE" in input.user.roles
    input.resource.type == "patient_record"
    input.resource.owner_id in input.user.assigned_patients
}
