package medtrust.authz

import future.keywords.if

default user_trusted := false
default user_suspicious := false
default user_blocked := false

user_blocked if {
    input.user.failed_attempts_24h >= 10
}

user_blocked if {
    input.user.anomaly_score > 0.8
}

user_suspicious if {
    input.user.failed_attempts_24h >= 3
    input.user.failed_attempts_24h < 10
}

user_trusted if {
    input.user.mfa_passed == true
    input.user.failed_attempts_24h < 3
    not user_blocked
}

user_score := s if {
    user_blocked
    s := 0.0
} else := s if {
    user_trusted
    s := 1.0
} else := s if {
    user_suspicious
    s := 0.4
} else := s if {
    s := 0.5
}

user_reason := r if {
    user_blocked
    r := "User blocked due to excessive failed attempts or high anomaly score"
} else := r if {
    user_suspicious
    r := "User is suspicious due to multiple failed attempts"
} else := r if {
    user_trusted
    r := "User trusted with valid MFA and low failed attempts"
} else := r if {
    r := "User lacks MFA verification"
}

user_result := {
    "trusted": user_trusted,
    "score": user_score,
    "reason": user_reason,
    "suspicious": user_suspicious
}
