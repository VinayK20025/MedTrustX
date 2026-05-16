"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Gauge, Histogram

gateway_requests_total = Counter(
    "gateway_requests_total",
    "Total requests processed by Kong",
    ["service", "method", "status_code"]
)

gateway_request_latency_seconds = Histogram(
    "gateway_request_latency_seconds",
    "Request latency in seconds",
    ["service", "endpoint"]
)

gateway_rate_limit_hits_total = Counter(
    "gateway_rate_limit_hits_total",
    "Total rate limit hits",
    ["tenant_id", "endpoint"]
)

gateway_waf_blocks_total = Counter(
    "gateway_waf_blocks_total",
    "Total requests blocked by WAF",
    ["rule", "threat_type"]
)

gateway_circuit_breaker_state = Gauge(
    "gateway_circuit_breaker_state",
    "Circuit breaker state per service (0=CLOSED, 1=HALF_OPEN, 2=OPEN)",
    ["service", "state"]
)

gateway_blocked_ips_gauge = Gauge(
    "gateway_blocked_ips_gauge",
    "Number of IP addresses currently blocked"
)

gateway_threats_detected_total = Counter(
    "gateway_threats_detected_total",
    "Total threats detected by type",
    ["threat_type"]
)
