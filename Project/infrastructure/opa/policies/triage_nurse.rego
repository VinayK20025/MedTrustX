package medtrustx.triage

import rego.v1

default allow = false

# ─── Triage Nurse ZTA Policy Decision ────────────────────────────────────────
# Tier-3 Clinical Operational — shift-bound, department-scoped
allow if {
  input.user.role == "triage-nurse"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  input.user.shift_status == "ON_DUTY"
  emergency_scope_allowed
  action_allowed
}

# ─── Emergency Department Scope Isolation ─────────────────────────────────────
emergency_scope_allowed if {
  input.resource.department == "emergency-care"
}

# Allow access if the resource is in a related emergency domain
emergency_scope_allowed if {
  input.resource.domain == "triage"
}

# ─── Permitted Actions ────────────────────────────────────────────────────────
action_allowed if { input.action == "triage.manage" }
action_allowed if { input.action == "patient.intake" }
action_allowed if { input.action == "acuity.assess" }
action_allowed if { input.action == "vitals.record" }
action_allowed if { input.action == "emergency.queue.manage" }
action_allowed if { input.action == "bed.routing.review" }
action_allowed if { input.action == "clinical.notes.limited" }
action_allowed if { input.action == "patient.read" }
action_allowed if { input.action == "infection.flag" }

# ─── Hard Denials — immutable clinical safety boundaries ─────────────────────
deny if { input.action == "medication.prescribe" }
deny if { input.action == "diagnosis.modify" }
deny if { input.action == "audit.log.disable" }
deny if { input.action == "phi.export.unrestricted" }
deny if { input.action == "iam.modify" }

allow = false if { deny }

# ─── Emergency Break-Glass (Mass Casualty / Trauma Surge) ────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "triage-nurse"
  input.user.mfa_verified == true
}
