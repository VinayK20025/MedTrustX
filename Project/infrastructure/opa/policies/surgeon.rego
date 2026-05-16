package medtrustx.surgeon

import rego.v1

default allow = false

# ─── Surgeon ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "surgeon"
  input.user.department == "surgery"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Surgical Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "patient.read"
  assigned_case
}

action_allowed if {
  input.action == "patient.write"
  assigned_case
}

action_allowed if {
  input.action == "surgery.manage"
  assigned_case
}

action_allowed if {
  input.action == "ot.manage"
}

action_allowed if {
  input.action == "clinical.note.write"
  assigned_case
}

# ─── Assigned Case Check ───────────────────────────────────────────────
assigned_case if {
  input.resource.case_id in input.user.assigned_cases
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "surgeon"
}
