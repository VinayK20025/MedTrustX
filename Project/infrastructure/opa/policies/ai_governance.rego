package medtrustx.aigovernance

import rego.v1

default allow = false

# ─── AI Governance Officer ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "ai-governance-officer"
  input.user.mfa_verified == true
  input.user.pam_session == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Governance Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "ai.governance.manage"
}

action_allowed if {
  input.action == "model.review"
}

action_allowed if {
  input.action == "ai.audit.review"
}

action_allowed if {
  input.action == "bias.assessment"
}

action_allowed if {
  input.action == "model.risk.review"
}

action_allowed if {
  input.action == "ai.policy.manage"
}

action_allowed if {
  input.action == "explainability.review"
}

action_allowed if {
  input.action == "clinical.ai.review"
}

action_allowed if {
  input.action == "ai.compliance.review"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "ai-governance-officer"
}
