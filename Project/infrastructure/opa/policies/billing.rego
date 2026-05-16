package medtrustx.billing

import rego.v1

default allow = false

# ─── Billing ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "billing"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Financial Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "billing.manage"
  financial_domain
}

action_allowed if {
  input.action == "claims.manage"
  financial_domain
}

action_allowed if {
  input.action == "insurance.process"
  financial_domain
}

action_allowed if {
  input.action == "invoice.generate"
  financial_domain
}

action_allowed if {
  input.action == "patient.read.financial"
  financial_domain
}

# ─── Assigned Domain Scope Check ──────────────────────────────────
financial_domain if {
  input.resource.domain == "billing"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "billing"
}
