from prometheus_client import Counter, Histogram, Gauge

rls_violations_total = Counter(
    "rls_violations_total",
    "Total RLS violations detected",
    ["tenant_id", "severity", "action_taken"]
)

rls_bypass_active_sessions = Gauge(
    "rls_bypass_active_sessions",
    "Number of active PAM bypass sessions",
    ["tenant_id"]
)

rls_query_isolation_verified = Counter(
    "rls_query_isolation_verified",
    "RLS proof verifications run",
    ["database", "table"]
)

rls_tenant_onboarding_duration_seconds = Histogram(
    "rls_tenant_onboarding_duration_seconds",
    "Time taken to onboard a tenant across all databases",
    ["tenant_slug"]
)

rls_tenant_offboarding_duration_seconds = Histogram(
    "rls_tenant_offboarding_duration_seconds",
    "Time taken to offboard a tenant across all databases",
    ["tenant_slug", "purge_data"]
)

rls_cross_tenant_attempts_total = Counter(
    "rls_cross_tenant_attempts_total",
    "Attempts to access another tenant's data",
    ["source_tenant", "target_tenant"]
)
