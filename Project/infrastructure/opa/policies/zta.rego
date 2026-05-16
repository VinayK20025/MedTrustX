# MedTrustX — OPA ZTA Policy Decision Engine
# Zero Trust: Never trust, always verify

package medtrust.authz.zta

import rego.v1
import data.medtrust.authz.rbac
import data.medtrust.authz.abac

default decision := {"allow": false, "reason": "denied_by_default"}

# ─── Main ZTA Decision ───────────────────────────────────────
decision := {"allow": true, "reason": "all_checks_passed", "risk_score": risk} if {
    rbac.allow
    tenant_authorized
    device_trusted
    session_valid
    risk < 0.7
}

# Super admin bypass
decision := {"allow": true, "reason": "super_admin_bypass", "risk_score": risk} if {
    "SUPER_ADMIN" in input.user.roles
    session_valid
}

# Step-up auth required (MFA)
decision := {"allow": false, "reason": "step_up_required", "action": "mfa"} if {
    rbac.allow
    tenant_authorized
    risk >= 0.7
    risk < 0.9
}

# Deny — risk too high
decision := {"allow": false, "reason": "risk_too_high", "risk_score": risk} if {
    risk >= 0.9
}

# Cross-tenant denied by default
decision := {"allow": false, "reason": "cross_tenant_access_denied"} if {
    not tenant_authorized
    not is_super_admin
}

is_super_admin if {
    "SUPER_ADMIN" in input.user.roles
}

# ─── Risk Scoring ────────────────────────────────────────────
risk := score if {
    scores := [
        device_risk,
        location_risk,
        behavior_risk,
        time_risk
    ]
    score := sum(scores) / count(scores)
}

device_risk := 0.0 if { input.context.device_compliant == true; input.context.device_registered == true }
device_risk := 0.5 if { input.context.device_compliant == true; input.context.device_registered == false }
device_risk := 0.8 if { input.context.device_compliant == false }
device_risk := 1.0 if { not input.context.device_compliant }

location_risk := 0.0 if { input.context.ip_trusted == true; input.context.geo_allowed == true }
location_risk := 0.4 if { input.context.ip_trusted == false; input.context.geo_allowed == true }
location_risk := 0.9 if { input.context.geo_allowed == false }
location_risk := 0.5 if { not input.context.ip_trusted }

behavior_risk := 0.0 if { input.context.anomaly_score < 0.3 }
behavior_risk := 0.5 if { input.context.anomaly_score >= 0.3; input.context.anomaly_score < 0.7 }
behavior_risk := 0.9 if { input.context.anomaly_score >= 0.7 }
behavior_risk := 0.3 if { not input.context.anomaly_score }

time_risk := 0.0 if { abac.within_working_hours }
time_risk := 0.3 if { not abac.within_working_hours }

# ─── Device Trust ────────────────────────────────────────────
device_trusted if {
    input.context.device_compliant == true
    input.context.device_registered == true
    input.context.device_trust_score >= 0.5
}

# Allow unregistered devices with step-up
device_trusted if {
    input.context.device_compliant == true
    input.context.mfa_verified == true
}

# Service Accounts and bots bypass device trust but require mTLS
device_trusted if {
    "SERVICE_ACCOUNT" in input.user.roles
    input.context.mtls_verified == true
}
device_trusted if {
    "IOMT_DEVICE" in input.user.roles
    input.context.mtls_verified == true
}

# ─── Session Validation ─────────────────────────────────────
session_valid if {
    input.context.session_active == true
    input.context.token_expired == false
}

# ─── Tenant Isolation ───────────────────────────────────────
tenant_authorized if {
    input.user.tenant_id == input.resource.tenant_id
}

tenant_authorized if {
    input.resource.tenant_id == "system"
}
