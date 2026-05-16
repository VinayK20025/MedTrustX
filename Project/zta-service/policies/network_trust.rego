package medtrust.authz

import future.keywords.if
import future.keywords.in

default network_trusted := false
default network_suspicious := false
default network_blocked := false

threat_list := {"192.168.100.100", "10.0.0.99"}

network_blocked if {
    input.network.source_ip in threat_list
}

network_trusted if {
    startswith(input.network.source_ip, "10.")
    not network_blocked
}

network_suspicious if {
    hour := to_number(substring(input.network.request_time_utc, 11, 2))
    hour < 6
}

network_suspicious if {
    hour := to_number(substring(input.network.request_time_utc, 11, 2))
    hour >= 22
}

network_score := s if {
    network_blocked
    s := 0.0
} else := s if {
    network_trusted
    not network_suspicious
    s := 1.0
} else := s if {
    network_trusted
    network_suspicious
    s := 0.6
} else := s if {
    not network_trusted
    not network_suspicious
    s := 0.5
} else := s if {
    s := 0.2
}

network_reason := r if {
    network_blocked
    r := "IP address is in known threat list"
} else := r if {
    network_trusted
    not network_suspicious
    r := "Trusted internal network"
} else := r if {
    network_suspicious
    r := "Request outside of normal operating hours (06:00-22:00 UTC)"
} else := r if {
    r := "Unknown network context"
}

network_result := {
    "trusted": network_trusted,
    "score": network_score,
    "reason": network_reason,
    "suspicious": network_suspicious
}
