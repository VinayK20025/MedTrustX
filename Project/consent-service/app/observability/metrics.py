"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Histogram

consent_grants_total = Counter(
    "consent_grants_total",
    "Total consents granted",
    ["tenant_id", "consent_type"]
)

consent_withdrawals_total = Counter(
    "consent_withdrawals_total",
    "Total consents withdrawn",
    ["tenant_id", "consent_type"]
)

consent_verification_requests = Counter(
    "consent_verification_requests",
    "Total consent verification checks",
    ["tenant_id", "status"]
)

smart_contract_interactions = Counter(
    "smart_contract_interactions",
    "Total interactions with blockchain",
    ["tenant_id", "action"]
)

consent_processing_seconds = Histogram(
    "consent_processing_seconds",
    "Time taken to process consent",
    ["action"]
)
