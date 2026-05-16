"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Gauge, Histogram

vitals_ingested_total = Counter(
    "vitals_ingested_total",
    "Total vitals ingested",
    ["tenant_id", "vital_type"]
)

vitals_anomalies_detected_total = Counter(
    "vitals_anomalies_detected_total",
    "Total vitals anomalies detected",
    ["tenant_id", "vital_type"]
)

cds_alerts_triggered_total = Counter(
    "cds_alerts_triggered_total",
    "Total CDS alerts triggered",
    ["alert_type", "severity"]
)

prescriptions_created_total = Counter(
    "prescriptions_created_total",
    "Total prescriptions created",
    ["tenant_id"]
)

prescriptions_blocked_by_cds_total = Counter(
    "prescriptions_blocked_by_cds_total",
    "Total prescriptions blocked by CDS",
    ["reason"]
)

orders_created_total = Counter(
    "orders_created_total",
    "Total clinical orders created",
    ["tenant_id", "order_type"]
)

drug_interactions_detected_total = Counter(
    "drug_interactions_detected_total",
    "Total drug interactions detected",
    ["severity"]
)

allergy_alerts_total = Counter(
    "allergy_alerts_total",
    "Total allergy alerts triggered",
    ["severity"]
)
