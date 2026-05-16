package medtrustx.patient_counselor

import rego.v1

default allow = false

# ─── Patient Counselor ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "patient-counselor"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Patient Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "patient.read.limited"
  assigned_patient
}

action_allowed if {
  input.action == "care.coordination"
  assigned_patient
}

action_allowed if {
  input.action == "appointment.manage"
}

action_allowed if {
  input.action == "support.note.write"
  assigned_patient
}

# ─── Assigned Patient Scope Check ──────────────────────────────────
assigned_patient if {
  input.resource.patient_id in input.user.assigned_patients
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "patient-counselor"
}
