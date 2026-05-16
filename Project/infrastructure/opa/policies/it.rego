package medtrustx.itadmin

import rego.v1

default allow = false

# ─── IT Administrator ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "it"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  input.user.pam_session == true
  action_allowed
}

# ─── Infrastructure Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "infra.manage"
}

action_allowed if {
  input.action == "system.admin"
}

action_allowed if {
  input.action == "endpoint.manage"
}

action_allowed if {
  input.action == "service.monitor"
}

action_allowed if {
  input.action == "application.support"
}

action_allowed if {
  input.action == "user.lifecycle.manage"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "it"
}
