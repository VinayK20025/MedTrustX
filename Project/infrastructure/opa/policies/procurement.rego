package medtrustx.procurement

import rego.v1

default allow = false

# ─── Procurement Manager ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "procurement"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  procurement_scope_allowed
  action_allowed
}

# ─── Procurement Scope Check ───────────────────────────────────────
procurement_scope_allowed if {
  input.resource.domain == "procurement"
}

# ─── Operational Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "procurement.manage"
}

action_allowed if {
  input.action == "vendor.manage"
}

action_allowed if {
  input.action == "purchase.approve"
}

action_allowed if {
  input.action == "inventory.review"
}

action_allowed if {
  input.action == "asset.acquire"
}

action_allowed if {
  input.action == "supplychain.monitor"
}

action_allowed if {
  input.action == "procurement.analytics.view"
}

action_allowed if {
  input.action == "stock.audit.review"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "procurement"
}
