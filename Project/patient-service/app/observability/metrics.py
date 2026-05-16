"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Gauge, Histogram

patient_records_accessed_total = Counter(
    "patient_records_accessed_total",
    "Total patient records accessed",
    ["tenant_id", "action"]
)

patient_fhir_requests_total = Counter(
    "patient_fhir_requests_total",
    "Total FHIR requests processed",
    ["resource_type", "method"]
)

patient_record_aggregation_seconds = Histogram(
    "patient_record_aggregation_seconds",
    "Time taken to aggregate patient records",
    ["tenant_id"]
)

active_patient_ws_connections_gauge = Gauge(
    "active_patient_ws_connections_gauge",
    "Active websocket connections for patient vitals",
    ["tenant_id"]
)

patient_consent_check_total = Counter(
    "patient_consent_check_total",
    "Total consent verification checks",
    ["consent_type", "result"]
)
