package medtrustx.networkadmin

import rego.v1

default allow = false

# ─── Network Administrator ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "network"
  input.user.mfa_verified == true
  input.user.device_trusted == true
  input.user.pam_session == true
  action_allowed
}

# ─── Network Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "network.manage"
}

action_allowed if {
  input.action == "vpn.manage"
}

action_allowed if {
  input.action == "routing.manage"
}

action_allowed if {
  input.action == "network.monitor"
}

action_allowed if {
  input.action == "sdwan.manage"
}

action_allowed if {
  input.action == "wireless.manage"
}

action_allowed if {
  input.action == "traffic.analysis"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "network"
}
