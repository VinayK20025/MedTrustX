package medtrustx.pathologist

import rego.v1

default allow = false

# ─── Pathologist ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "pathologist"
  input.user.department == "pathology"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Diagnostic Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "lab.manage"
}

action_allowed if {
  input.action == "diagnostic.validate"
  assigned_lab_scope
}

action_allowed if {
  input.action == "lab.report.signoff"
  assigned_lab_scope
}

action_allowed if {
  input.action == "critical.result.approve"
  assigned_lab_scope
}

action_allowed if {
  input.action == "patient.read"
  assigned_lab_scope
}

# ─── Assigned Lab Scope Check ───────────────────────────────────────────────
assigned_lab_scope if {
  input.resource.lab_scope == input.user.specialty
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "pathologist"
}
