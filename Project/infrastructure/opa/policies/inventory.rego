package medtrustx.inventory

import rego.v1

default allow = false

# ─── Inventory Manager ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "inventory"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  inventory_scope_allowed
  action_allowed
}

# ─── Inventory Scope Check ───────────────────────────────────────
inventory_scope_allowed if {
  input.resource.domain == "inventory"
}

# ─── Operational Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "inventory.manage"
}

action_allowed if {
  input.action == "stock.audit"
}

action_allowed if {
  input.action == "supplychain.monitor"
}

action_allowed if {
  input.action == "asset.track"
}

action_allowed if {
  input.action == "warehouse.manage"
}

action_allowed if {
  input.action == "expiry.monitor"
}

action_allowed if {
  input.action == "inventory.analytics.view"
}

action_allowed if {
  input.action == "stock.reconcile"
}

action_allowed if {
  input.action == "vendor.stock.review"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "inventory"
}
