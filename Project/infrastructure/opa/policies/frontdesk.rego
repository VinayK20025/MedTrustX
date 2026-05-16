package medtrustx.frontdesk

import rego.v1

default allow = false

# ─── Front Desk ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "front-desk"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  input.user.shift_active == true
  action_allowed
}

# ─── Operational Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "patient.registration"
}

action_allowed if {
  input.action == "appointment.manage"
}

action_allowed if {
  input.action == "visitor.manage"
}

action_allowed if {
  input.action == "queue.manage"
}

action_allowed if {
  input.action == "admission.initiate"
}

action_allowed if {
  input.action == "patient.read.basic"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "front-desk"
}
