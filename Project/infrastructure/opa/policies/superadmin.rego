package medtrustx.superadmin

import rego.v1

default allow = false

# ─── Super Admin ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "super-admin"
  input.user.mfa_verified == true
  input.user.hardware_key_verified == true
  input.user.pam_session == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Global Enterprise Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "enterprise.manage"
}

action_allowed if {
  input.action == "tenant.manage"
}

action_allowed if {
  input.action == "security.governance"
}

action_allowed if {
  input.action == "iam.root.manage"
}

action_allowed if {
  input.action == "policy.override"
}

action_allowed if {
  input.action == "audit.review.global"
}

action_allowed if {
  input.action == "compliance.manage.global"
}

action_allowed if {
  input.action == "infrastructure.governance"
}

action_allowed if {
  input.action == "executive.analytics.review"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "super-admin"
}
