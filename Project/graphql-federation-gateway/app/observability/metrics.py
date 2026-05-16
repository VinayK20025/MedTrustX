"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Histogram

graphql_requests_total = Counter(
    "graphql_requests_total",
    "Total GraphQL requests",
    ["operation_type", "operation_name"]
)

graphql_request_latency_seconds = Histogram(
    "graphql_request_latency_seconds",
    "GraphQL request latency",
    ["operation_name"]
)

graphql_errors_total = Counter(
    "graphql_errors_total",
    "Total GraphQL execution errors",
    ["error_type"]
)

federation_subrequest_latency_seconds = Histogram(
    "federation_subrequest_latency_seconds",
    "Latency of subrequests to composition gateway",
    ["target_service"]
)
