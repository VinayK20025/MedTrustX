package medtrustx.devsecops

import rego.v1

default allow = false

# ─── DevSecOps Engineer ZTA Policy Decision ───────────────────────────────────────
allow if {
  input.user.role == "devsecops"
  input.user.mfa_verified == true
  input.user.pam_session == true
  input.user.device_trusted == true
  action_allowed
}

# ─── Infrastructure Scope Isolation ──────────────────────────────────────────
action_allowed if {
  input.action == "cicd.manage"
}

action_allowed if {
  input.action == "iac.manage"
}

action_allowed if {
  input.action == "container.security.manage"
}

action_allowed if {
  input.action == "k8s.manage"
}

action_allowed if {
  input.action == "runtime.security.review"
}

action_allowed if {
  input.action == "pipeline.deploy"
}

action_allowed if {
  input.action == "security.scan.manage"
}

action_allowed if {
  input.action == "cloud.security.review"
}

action_allowed if {
  input.action == "artifact.manage"
}

# ─── Emergency Break-Glass Access ──────────────────────────────────────
allow if {
  input.action == "emergency_override"
  input.emergency == true
  input.user.role == "devsecops"
}
