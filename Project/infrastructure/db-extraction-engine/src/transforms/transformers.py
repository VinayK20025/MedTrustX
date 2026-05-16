"""
MedTrustX DB Extraction Engine — Transformation Layer (§3C)

Transforms raw data into actionable insights.
raw: {bp: 180, hr: 120} → insight: "Critical patient"
"""
from typing import Any, Dict, List
import structlog

logger = structlog.get_logger()


class VitalsTransformer:
    """Transforms raw vital sign data into risk assessments."""

    CRITICAL_THRESHOLDS = {
        "systolic_bp": {"high": 180, "low": 90},
        "heart_rate": {"high": 120, "low": 50},
        "spo2": {"low": 90},
        "temperature": {"high": 39.5, "low": 35.0},
        "respiratory_rate": {"high": 30, "low": 8},
    }

    @classmethod
    def assess_risk(cls, vitals: Dict[str, float]) -> Dict[str, Any]:
        alerts = []
        risk_score = 0.0

        for metric, value in vitals.items():
            thresholds = cls.CRITICAL_THRESHOLDS.get(metric, {})
            if "high" in thresholds and value >= thresholds["high"]:
                alerts.append({"metric": metric, "value": value, "alert": "critical_high"})
                risk_score += 0.3
            elif "low" in thresholds and value <= thresholds["low"]:
                alerts.append({"metric": metric, "value": value, "alert": "critical_low"})
                risk_score += 0.3

        risk_level = "LOW"
        if risk_score >= 0.6:
            risk_level = "HIGH"
        elif risk_score >= 0.3:
            risk_level = "MEDIUM"

        return {"risk_level": risk_level, "risk_score": min(risk_score, 1.0), "alerts": alerts}


class AggregationEngine:
    """§3D — Performs counts, averages, trend analysis."""

    @staticmethod
    def compute_averages(records: List[Dict[str, float]], field: str) -> float:
        values = [r[field] for r in records if field in r and r[field] is not None]
        return sum(values) / len(values) if values else 0.0

    @staticmethod
    def compute_trend(values: List[float]) -> str:
        if len(values) < 2:
            return "insufficient_data"
        recent = sum(values[-3:]) / min(3, len(values))
        older = sum(values[:3]) / min(3, len(values))
        if recent > older * 1.1:
            return "increasing"
        elif recent < older * 0.9:
            return "decreasing"
        return "stable"

    @staticmethod
    def compute_percentiles(values: List[float]) -> Dict[str, float]:
        if not values:
            return {"p50": 0, "p90": 0, "p99": 0}
        sorted_vals = sorted(values)
        n = len(sorted_vals)
        return {
            "p50": sorted_vals[int(n * 0.5)],
            "p90": sorted_vals[int(n * 0.9)],
            "p99": sorted_vals[min(int(n * 0.99), n - 1)],
        }
