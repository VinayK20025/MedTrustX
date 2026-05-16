package medtrustx.ethics

import rego.v1

default allow = false

# ─── Ethics ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "ethics"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  ethics_scope_allowed
  action_allowed
}

# ─── Assigned Scope Check ───────────────────────────────────────
ethics_scope_allowed if {
  input.resource.review_scope == input.user.assigned_scope
}

# ─── Ethics Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "ethics.review"
}

action_allowed if {
  input.action == "research.review"
}

action_allowed if {
  input.action == "consent.review"
}

action_allowed if {
  input.action == "clinical.protocol.review"
}

action_allowed if {
  input.action == "regulatory.ethics.review"
}

action_allowed if {
  input.action == "trial.approval.review"
}

action_allowed if {
  input.action == "policy.review"
}

action_allowed if {
  input.action == "compliance.review"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "ethics"
}
