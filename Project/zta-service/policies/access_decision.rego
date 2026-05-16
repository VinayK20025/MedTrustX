package medtrust.authz

import future.keywords.if

device := device_result
network := network_result
user := user_result

default allow := false
default step_up_required := false
default reason := "Access denied by default"
default policy_rule := "default_deny"

allow if {
    device.trusted
    network.trusted
    user.trusted
    not any_blocked
}

allow if {
    not any_blocked
    any_suspicious
}

step_up_required if {
    not any_blocked
    any_suspicious
}

any_blocked if {
    device.score == 0.0
}
any_blocked if {
    network.score == 0.0
}
any_blocked if {
    user.score == 0.0
}

any_suspicious if {
    network.suspicious
}
any_suspicious if {
    user.suspicious
}
any_suspicious if {
    device.score < 1.0
    device.score > 0.0
}

trust_score := (device.score * 0.40) + (user.score * 0.35) + (network.score * 0.25)

reason := r if {
    any_blocked
    r := "Access blocked due to critical trust degradation in one or more contexts."
} else := r if {
    step_up_required
    r := "Access provisionally allowed but step-up authentication is required."
} else := r if {
    allow
    r := "Access allowed."
} else := r if {
    r := "Access denied."
}

policy_rule := pr if {
    any_blocked
    pr := "blocked_context"
} else := pr if {
    step_up_required
    pr := "suspicious_context_requires_step_up"
} else := pr if {
    allow
    pr := "fully_trusted"
} else := pr if {
    pr := "default_deny"
}
