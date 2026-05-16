package medtrustx.externalauditor

import rego.v1

default allow = false

# ─── External Auditor ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "external-auditor"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  input.user.read_only_mode == true
  action_allowed
}

# ─── Governance Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "audit.review"
}

action_allowed if {
  input.action == "compliance.review"
}

action_allowed if {
  input.action == "financial.review.readonly"
}

action_allowed if {
  input.action == "policy.review"
}

action_allowed if {
  input.action == "risk.review"
}

action_allowed if {
  input.action == "governance.analytics.view"
}

action_allowed if {
  input.action == "report.export.readonly"
}

action_allowed if {
  input.action == "evidence.review.readonly"
}

action_allowed if {
  input.action == "operational.review.readonly"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "external-auditor"
}
