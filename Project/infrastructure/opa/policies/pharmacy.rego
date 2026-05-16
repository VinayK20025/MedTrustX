package medtrustx.pharmacy

import rego.v1

default allow = false

# ─── Pharmacy ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "pharmacy"
  input.user.department == "pharmacy"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Medication Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "medication.manage"
  prescription_scope_allowed
}

action_allowed if {
  input.action == "dispense.medication"
  prescription_scope_allowed
}

action_allowed if {
  input.action == "inventory.manage"
  prescription_scope_allowed
}

action_allowed if {
  input.action == "prescription.review"
  prescription_scope_allowed
}

action_allowed if {
  input.action == "patient.read"
  prescription_scope_allowed
}

# ─── Assigned Prescription Scope Check ──────────────────────────────────
prescription_scope_allowed if {
  input.resource.department == "pharmacy"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "pharmacy"
}
