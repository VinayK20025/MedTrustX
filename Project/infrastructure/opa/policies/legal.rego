package medtrustx.legal

import rego.v1

default allow = false

# ─── Legal Advisor ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "legal"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  legal_case_scope_allowed
  action_allowed
}

# ─── Case Assignment Check ───────────────────────────────────────
legal_case_scope_allowed if {
  input.resource.case_id in input.user.assigned_cases
}

# ─── Governance Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "legal.review"
}

action_allowed if {
  input.action == "litigation.review"
}

action_allowed if {
  input.action == "policy.review"
}

action_allowed if {
  input.action == "contract.review"
}

action_allowed if {
  input.action == "audit.review"
}

action_allowed if {
  input.action == "consent.review"
}

action_allowed if {
  input.action == "regulatory.report.review"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "legal"
}
