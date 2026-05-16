from prometheus_client import Counter, Histogram, Gauge

pam_access_requests_total = Counter(
    "pam_access_requests_total",
    "Total JIT access requests",
    ["resource_type", "status"]
)

pam_approval_duration_seconds = Histogram(
    "pam_approval_duration_seconds",
    "Time taken to approve or deny JIT requests",
    ["resource_type"]
)

pam_active_privileged_sessions_gauge = Gauge(
    "pam_active_privileged_sessions_gauge",
    "Currently active privileged (bypassed) sessions",
    ["tenant_id"]
)

pam_session_recording_events_total = Counter(
    "pam_session_recording_events_total",
    "Total events recorded in privileged sessions",
    ["event_type"]
)

pam_jit_access_granted_total = Counter(
    "pam_jit_access_granted_total",
    "Total JIT accesses granted",
    ["tenant_id", "resource_type"]
)
