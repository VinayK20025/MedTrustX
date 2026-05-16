from prometheus_client import Counter, Histogram, Gauge

zta_access_decisions_total = Counter(
    "zta_access_decisions_total",
    "Total ZTA access decisions",
    ["decision", "policy_rule", "tenant_id"]
)

zta_trust_score_histogram = Histogram(
    "zta_trust_score_histogram",
    "Distribution of computed trust scores",
    ["user_id", "device_id"],
    buckets=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
)

zta_opa_latency_seconds = Histogram(
    "zta_opa_latency_seconds",
    "Latency of calls to OPA",
    ["policy"]
)

zta_opa_fallback_total = Counter(
    "zta_opa_fallback_total",
    "Number of times OPA fallback engine was used",
    ["reason"]
)

zta_device_compliance_status = Gauge(
    "zta_device_compliance_status",
    "Current device compliance statuses count",
    ["status", "tenant_id"]
)

zta_continuous_reverification_total = Counter(
    "zta_continuous_reverification_total",
    "Total continuous reverifications triggered",
    ["trigger", "result"]
)
