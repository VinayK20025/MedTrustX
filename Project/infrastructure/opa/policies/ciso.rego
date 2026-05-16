package medtrustx.ciso

import rego.v1

default allow = false

# ─── CISO ZTA Policy Decision ────────────────────────────────────────────────
# Tier-7 Critical Security Executive — requires hardware key on top of PAM + MFA
allow if {
  input.user.role == "ciso"
  input.user.mfa_verified == true
  input.user.hardware_key_verified == true
  input.user.pam_session == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Security Governance Scope ───────────────────────────────────────────────
action_allowed if { input.action == "security.governance" }
action_allowed if { input.action == "incident.manage" }
action_allowed if { input.action == "threat.manage" }
action_allowed if { input.action == "iam.governance" }
action_allowed if { input.action == "zero_trust.manage" }
action_allowed if { input.action == "risk.manage" }
action_allowed if { input.action == "security.audit.review" }
action_allowed if { input.action == "policy.override" }
action_allowed if { input.action == "security.analytics.review" }
action_allowed if { input.action == "emergency.security.override" }

# ─── Hard Denials — immutable even for CISO ─────────────────────────────────
deny if { input.action == "audit.log.delete" }
deny if { input.action == "forensic.chain.disable" }
deny if { input.action == "siem.disable.permanent" }
deny if { input.action == "mfa.bypass" }

# deny takes precedence over allow
allow = false if { deny }

# ─── Emergency Break-Glass ──────────────────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "ciso"
  # Even break-glass requires hardware key
  input.user.hardware_key_verified == true
}
