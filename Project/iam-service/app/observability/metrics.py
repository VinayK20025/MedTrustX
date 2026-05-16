from prometheus_client import Counter, Histogram, Gauge

iam_login_attempts_total = Counter(
    "iam_login_attempts_total",
    "Total login attempts",
    ["method", "status", "tenant_id"]
)

iam_mfa_challenges_total = Counter(
    "iam_mfa_challenges_total",
    "Total MFA challenges issued and verified",
    ["method", "result"]
)

iam_session_duration_seconds = Histogram(
    "iam_session_duration_seconds",
    "Duration of user sessions before revocation or expiry",
    ["role", "tenant_id"]
)

iam_active_sessions_gauge = Gauge(
    "iam_active_sessions_gauge",
    "Number of currently active sessions",
    ["tenant_id"]
)

iam_scim_operations_total = Counter(
    "iam_scim_operations_total",
    "Total SCIM operations",
    ["operation", "status"]
)

iam_token_blacklist_size_gauge = Gauge(
    "iam_token_blacklist_size_gauge",
    "Current number of tokens in the redis blacklist"
)
