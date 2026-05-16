package medtrustx.infosecrisk

import rego.v1

default allow = false

# ─── InfoSec Risk Manager ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "infosec-risk"
  input.user.mfa_verified == true
  input.user.pam_session == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Governance Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "risk.manage"
}

action_allowed if {
  input.action == "security.review"
}

action_allowed if {
  input.action == "threat.review"
}

action_allowed if {
  input.action == "iam.review"
}

action_allowed if {
  input.action == "security.policy.review"
}

action_allowed if {
  input.action == "audit.review"
}

action_allowed if {
  input.action == "compliance.manage"
}

action_allowed if {
  input.action == "security.analytics.view"
}

action_allowed if {
  input.action == "thirdparty.risk.review"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "infosec-risk"
}
