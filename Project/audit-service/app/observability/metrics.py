"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Histogram

audit_events_written_total = Counter(
    "audit_events_written_total",
    "Total audit events written",
    ["tenant_id", "action"]
)

audit_chain_integrity_failures_total = Counter(
    "audit_chain_integrity_failures_total",
    "Total chain integrity failures detected",
    ["tenant_id"]
)

audit_breach_incidents_total = Counter(
    "audit_breach_incidents_total",
    "Total breach incidents detected",
    ["severity", "breach_type"]
)

audit_breach_notification_latency_seconds = Histogram(
    "audit_breach_notification_latency_seconds",
    "Time from detection to notification",
    ["severity"]
)

audit_hash_computation_duration_seconds = Histogram(
    "audit_hash_computation_duration_seconds",
    "Time spent computing hashes",
    ["tenant_id"]
)
