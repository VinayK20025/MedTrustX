package medtrust.authz

import future.keywords.if

default device_trusted := false
default device_blocked := false

device_trusted if {
    input.device.compliance_status == "compliant"
}

device_trusted if {
    input.device.compliance_status == "missing_av"
    input.device.patch_level == "current"
}

device_blocked if {
    input.device.compliance_status == "jailbroken"
}

device_blocked if {
    input.device.compliance_status == "unregistered"
}

device_score := s if {
    device_blocked
    s := 0.0
} else := s if {
    input.device.compliance_status == "compliant"
    s := 1.0
} else := s if {
    input.device.compliance_status == "missing_av"
    input.device.patch_level == "current"
    s := 0.6
} else := s if {
    s := 0.3
}

device_reason := r if {
    device_blocked
    r := "Device is blocked due to policy (jailbroken or unregistered)"
} else := r if {
    input.device.compliance_status == "compliant"
    r := "Device is fully compliant"
} else := r if {
    input.device.compliance_status == "missing_av"
    input.device.patch_level == "current"
    r := "Missing AV but patch level is current"
} else := r if {
    r := "Device trust is degraded"
}

device_result := {
    "trusted": device_trusted,
    "score": device_score,
    "reason": device_reason
}
