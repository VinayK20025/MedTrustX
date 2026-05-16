package medtrustx.infectioncontrol

import rego.v1

default allow = false

# ─── Infection Control ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "infection-nurse"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Surveillance Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "infection.manage"
  surveillance_scope_allowed
}

action_allowed if {
  input.action == "patient.read"
  surveillance_scope_allowed
}

action_allowed if {
  input.action == "isolation.monitor"
  surveillance_scope_allowed
}

action_allowed if {
  input.action == "hai.analytics.view"
  surveillance_scope_allowed
}

action_allowed if {
  input.action == "clinical.audit.review"
  surveillance_scope_allowed
}

action_allowed if {
  input.action == "outbreak.monitor"
  surveillance_scope_allowed
}

action_allowed if {
  input.action == "sterilization.review"
  surveillance_scope_allowed
}

action_allowed if {
  input.action == "epidemiology.report"
  surveillance_scope_allowed
}

# ─── Assigned Domain Scope Check ──────────────────────────────────
surveillance_scope_allowed if {
  input.resource.domain == "infection-control"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "infection-nurse"
}
