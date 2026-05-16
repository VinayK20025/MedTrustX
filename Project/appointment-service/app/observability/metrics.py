"""
Prometheus Metrics definition.
"""
from prometheus_client import Counter, Gauge, Histogram

appointments_scheduled_total = Counter(
    "appointments_scheduled_total",
    "Total appointments scheduled",
    ["tenant_id", "type"]
)

appointments_cancelled_total = Counter(
    "appointments_cancelled_total",
    "Total appointments cancelled",
    ["tenant_id", "reason"]
)

waitlist_additions_total = Counter(
    "waitlist_additions_total",
    "Total additions to waitlist",
    ["tenant_id"]
)

waitlist_promotions_total = Counter(
    "waitlist_promotions_total",
    "Total waitlist patients promoted to appointments",
    ["tenant_id"]
)

schedule_conflicts_detected_total = Counter(
    "schedule_conflicts_detected_total",
    "Total schedule conflicts detected during booking",
    ["tenant_id"]
)
