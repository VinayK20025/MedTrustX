"""
Prometheus Metrics definition.
"""
from prometheus_client import Gauge, Counter, Histogram

compliance_score_gauge = Gauge(
    "compliance_score_gauge",
    "Compliance score 0-100",
    ["tenant_id", "framework"]
)

compliance_controls_total = Counter(
    "compliance_controls_total",
    "Total controls evaluated",
    ["framework", "status"]
)

compliance_gaps_total = Counter(
    "compliance_gaps_total",
    "Total compliance gaps identified",
    ["framework", "severity"]
)

compliance_risks_total = Counter(
    "compliance_risks_total",
    "Total risks in risk register",
    ["tenant_id", "category", "treatment"]
)

compliance_report_generation_seconds = Histogram(
    "compliance_report_generation_seconds",
    "Time taken to generate reports",
    ["report_type"]
)

compliance_access_reviews_flagged_total = Counter(
    "compliance_access_reviews_flagged_total",
    "Total access reviews flagged for remediation",
    ["tenant_id"]
)
