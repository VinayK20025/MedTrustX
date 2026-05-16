package medtrustx.hospital_admin

import rego.v1

default allow = false

# ─── Hospital Administrator ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "hospital_admin"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Operational Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "operations.manage"
}

action_allowed if {
  input.action == "facility.manage"
}

action_allowed if {
  input.action == "billing.manage"
}

action_allowed if {
  input.action == "inventory.manage"
}

action_allowed if {
  input.action == "patient.read.limited"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "hospital_admin"
}
