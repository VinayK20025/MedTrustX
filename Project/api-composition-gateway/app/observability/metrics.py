"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Gauge, Histogram

composition_requests_total = Counter(
    "composition_requests_total",
    "Total composed requests",
    ["composition_type", "status"]
)

composition_latency_seconds = Histogram(
    "composition_latency_seconds",
    "Composed request latency",
    ["composition_type"]
)

service_discovery_resolution_seconds = Histogram(
    "service_discovery_resolution_seconds",
    "Time to resolve service from registry",
    ["service"]
)

circuit_breaker_trips_total = Counter(
    "circuit_breaker_trips_total",
    "Number of times circuit breaker tripped",
    ["service"]
)

auth_validation_latency_seconds = Histogram(
    "auth_validation_latency_seconds",
    "Auth triple validation latency",
    ["method"]
)

auth_failures_total = Counter(
    "auth_failures_total",
    "Total auth validation failures",
    ["reason"]
)

load_balancer_selection_total = Counter(
    "load_balancer_selection_total",
    "Load balancer instance selections",
    ["service", "instance"]
)
