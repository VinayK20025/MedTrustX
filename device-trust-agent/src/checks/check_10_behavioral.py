"""
MedTrustX Device Trust Agent — Check 10: Behavioral Anomaly Score (weight: 5%).

Queries the iam_db auth_logs table (14,685 seeded rows) to compute a
behavioral anomaly score by comparing the current session's signals
against the device's 30-day historical patterns.

Five anomaly signals:
  A. Login at unusual hour compared to historical pattern
  B. Login from new geographic location / new IP
  C. > 3 failed auth attempts in last 24h
  D. Request velocity > 5× historical baseline
  E. Simultaneous active sessions on different device_id for same user

Scoring:
  10 — 0 anomaly signals
   8 — 1 signal
   5 — 2 signals
   3 — 3 signals (step-up MFA required)
   1 — 4–5 signals → immediate step-up or block
"""

from __future__ import annotations

import asyncio
import ipaddress
import os
import socket
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)

# Anomaly thresholds
MAX_FAILED_ATTEMPTS_24H = 3
VELOCITY_MULTIPLIER = 5.0
HISTORY_DAYS = 30
TOP_N_HOURS = 5
HISTORY_LIMIT = 1000


class BehavioralAnomalyCheck(BaseCheck):
    """Check 10 — Behavioral Anomaly Score.

    Analyses real auth_logs data from iam_db to detect deviations
    from the device's established behavioral baseline.
    """

    CHECK_ID = 10
    CHECK_NAME = "Behavioral Anomaly Score"
    WEIGHT = 0.05
    TIMEOUT_SECONDS = 20

    def is_supported(self, platform: Platform) -> bool:
        return platform in (
            Platform.WINDOWS,
            Platform.MACOS,
            Platform.LINUX,
            Platform.IOS,
            Platform.ANDROID,
        )

    async def run(self) -> CheckResult:
        """Query iam_db and compute behavioral anomaly score."""
        return await asyncio.get_event_loop().run_in_executor(
            None, self._check_behavioral
        )

    # ── Main behavioral check ──────────────────────────────────────────────

    def _check_behavioral(self) -> CheckResult:
        """Execute all five anomaly signal checks against iam_db."""
        from src.config import get_config
        config = get_config()

        details: Dict[str, Any] = {}
        recommendations: List[str] = []
        triggered_signals: List[str] = []

        device_id = config.agent_device_id
        if not device_id:
            return self._make_result(
                score=5.0,
                details={"reason": "device_id_not_configured"},
                recommendations=["Device ID not configured. Behavioral check skipped."],
            )

        # Fetch historical auth logs
        history, fetch_error = self._fetch_auth_history(device_id, config)
        details["history_records_fetched"] = len(history)
        details["fetch_error"] = fetch_error

        if fetch_error and not history:
            return self._make_result(
                score=5.0,
                details=details,
                recommendations=[
                    f"Could not fetch behavioral history: {fetch_error}. "
                    "Verify iam_db connectivity."
                ],
            )

        # Compute baseline from history
        baseline = self._compute_baseline(history)
        details["baseline"] = {
            "typical_hours": list(baseline["typical_hours"]),
            "known_ip_count": len(baseline["known_ips"]),
            "avg_requests_per_session": round(baseline["avg_requests_per_session"], 2),
        }

        # Get current session context from environment
        current_context = self._get_current_context(config)
        details["current_context"] = {
            k: v for k, v in current_context.items()
            if k not in ("user_id",)  # omit PII from details
        }

        # ── Signal A: Unusual login hour ──────────────────────────────────
        signal_a, signal_a_detail = self._check_signal_a_unusual_hour(
            current_context.get("current_hour"),
            baseline["typical_hours"],
        )
        details["signal_a_unusual_hour"] = signal_a_detail
        if signal_a:
            triggered_signals.append("A:unusual_hour")
            recommendations.append(
                f"Login at unusual hour {current_context.get('current_hour')}:00 UTC. "
                f"Typical hours: {sorted(baseline['typical_hours'])}."
            )

        # ── Signal B: New location / IP ────────────────────────────────────
        signal_b, signal_b_detail = self._check_signal_b_new_location(
            current_context.get("current_ip"),
            baseline["known_ips"],
        )
        details["signal_b_new_location"] = signal_b_detail
        if signal_b:
            triggered_signals.append("B:new_location")
            recommendations.append(
                f"Login from new IP/location: {current_context.get('current_ip')}. "
                "Step-up MFA recommended."
            )

        # ── Signal C: Failed auth spike ───────────────────────────────────
        signal_c, signal_c_detail = self._check_signal_c_failed_auths(
            device_id, config
        )
        details["signal_c_failed_auths"] = signal_c_detail
        if signal_c:
            triggered_signals.append("C:failed_auth_spike")
            recommendations.append(
                f"Excessive failed auth attempts in last 24h: "
                f"{signal_c_detail.get('count', 0)}. "
                "Possible brute-force attack."
            )

        # ── Signal D: Request velocity ────────────────────────────────────
        signal_d, signal_d_detail = self._check_signal_d_velocity(
            current_context.get("current_requests_per_min"),
            baseline["avg_requests_per_session"],
        )
        details["signal_d_velocity"] = signal_d_detail
        if signal_d:
            triggered_signals.append("D:high_velocity")
            recommendations.append(
                f"Request velocity {signal_d_detail.get('current_rpm', 0):.1f} req/min is "
                f"{VELOCITY_MULTIPLIER}× above baseline "
                f"({signal_d_detail.get('baseline_rpm', 0):.1f} req/min)."
            )

        # ── Signal E: Simultaneous device hop ────────────────────────────
        user_id = current_context.get("user_id", "")
        signal_e, signal_e_detail = self._check_signal_e_device_hop(
            device_id, user_id, config
        )
        details["signal_e_device_hop"] = signal_e_detail
        if signal_e:
            triggered_signals.append("E:simultaneous_device")
            recommendations.append(
                f"User {user_id[:8]}... has active sessions on multiple devices simultaneously. "
                "Possible account sharing or compromise."
            )

        # ── Score mapping ─────────────────────────────────────────────────
        anomaly_count = len(triggered_signals)
        details["anomaly_count"] = anomaly_count
        details["triggered_signals"] = triggered_signals

        score_map = {0: 10.0, 1: 8.0, 2: 5.0, 3: 3.0}
        score = score_map.get(anomaly_count, 1.0)  # 4-5 signals = 1.0

        if anomaly_count == 0:
            recommendations.append("Behavioral analysis: no anomaly signals detected.")
        elif anomaly_count >= 4:
            recommendations.append(
                f"{anomaly_count} behavioral anomaly signals triggered. "
                "Immediate step-up MFA or device block required."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    # ── Database queries ───────────────────────────────────────────────────

    def _fetch_auth_history(
        self, device_id: str, config: Any
    ) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        """Fetch last HISTORY_LIMIT auth_log rows for this device_id from iam_db."""
        try:
            import psycopg2
            import psycopg2.extras
            conn = psycopg2.connect(**config.get_db_connect_kwargs())
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            since = datetime.now(timezone.utc) - timedelta(days=HISTORY_DAYS)
            cur.execute(
                """
                SELECT
                    id,
                    device_id,
                    user_id,
                    action,
                    ip_address,
                    mfa_passed,
                    decision,
                    logged_at,
                    metadata
                FROM auth_logs
                WHERE device_id = %s
                  AND logged_at >= %s
                ORDER BY logged_at DESC
                LIMIT %s
                """,
                (device_id, since, HISTORY_LIMIT),
            )
            rows = [dict(row) for row in cur.fetchall()]
            cur.close()
            conn.close()
            return rows, None
        except Exception as exc:
            logger.warning("auth_history_fetch_failed", device_id=device_id[:8], error=str(exc))
            return [], str(exc)

    def _compute_baseline(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute behavioral baseline metrics from historical auth_log rows."""
        login_hours: Counter = Counter()
        known_ips: Set[str] = set()
        request_counts: List[int] = []
        session_requests = 0

        for row in history:
            logged_at = row.get("logged_at")
            if isinstance(logged_at, datetime):
                if logged_at.tzinfo is None:
                    logged_at = logged_at.replace(tzinfo=timezone.utc)
                login_hours[logged_at.hour] += 1

            ip = row.get("ip_address") or ""
            if ip:
                known_ips.add(ip)

            # Count actions as proxy for request velocity
            session_requests += 1

        # Top N typical hours
        typical_hours: Set[int] = {
            hour for hour, _ in login_hours.most_common(TOP_N_HOURS)
        }

        # Average requests per "session" (simplified: total / 30 days / 8h avg session)
        total_days = HISTORY_DAYS
        sessions_estimate = max(total_days, 1)
        avg_requests_per_session = session_requests / sessions_estimate

        return {
            "typical_hours": typical_hours,
            "known_ips": known_ips,
            "avg_requests_per_session": avg_requests_per_session,
            "login_hour_distribution": dict(login_hours),
        }

    def _get_current_context(self, config: Any) -> Dict[str, Any]:
        """Build current session context from environment and config."""
        now = datetime.now(timezone.utc)
        current_ip = os.environ.get("MEDTRUSTX_SESSION_IP", "")
        if not current_ip:
            # Attempt to resolve local IP
            try:
                current_ip = socket.gethostbyname(socket.gethostname())
            except Exception:
                current_ip = "127.0.0.1"

        current_rpm_str = os.environ.get("MEDTRUSTX_REQUESTS_PER_MIN", "")
        current_rpm: Optional[float] = None
        try:
            current_rpm = float(current_rpm_str)
        except (ValueError, TypeError):
            pass

        return {
            "current_hour": now.hour,
            "current_ip": current_ip,
            "current_requests_per_min": current_rpm,
            "user_id": os.environ.get("MEDTRUSTX_USER_ID", ""),
            "timestamp": now.isoformat(),
        }

    # ── Signal checks ──────────────────────────────────────────────────────

    def _check_signal_a_unusual_hour(
        self,
        current_hour: Optional[int],
        typical_hours: Set[int],
    ) -> Tuple[bool, Dict[str, Any]]:
        """Signal A: Login at hour outside the device's top-5 typical hours."""
        if current_hour is None:
            return False, {"skipped": "no_current_hour"}
        if not typical_hours:
            return False, {"skipped": "no_baseline_hours"}

        is_unusual = current_hour not in typical_hours
        return is_unusual, {
            "current_hour": current_hour,
            "typical_hours": sorted(typical_hours),
            "triggered": is_unusual,
        }

    def _check_signal_b_new_location(
        self,
        current_ip: Optional[str],
        known_ips: Set[str],
    ) -> Tuple[bool, Dict[str, Any]]:
        """Signal B: Login from an IP not seen in last 30 days, different geo."""
        if not current_ip or current_ip in ("127.0.0.1", "::1"):
            return False, {"skipped": "no_routable_ip"}
        if not known_ips:
            return False, {"skipped": "no_baseline_ips", "current_ip": current_ip}

        ip_is_new = current_ip not in known_ips
        if not ip_is_new:
            return False, {"current_ip": current_ip, "triggered": False}

        # Determine if this is a different network (different /24)
        try:
            current_net = ipaddress.ip_network(f"{current_ip}/24", strict=False)
            known_nets = {
                ipaddress.ip_network(f"{ip}/24", strict=False)
                for ip in known_ips
                if re.match(r"^\d+\.\d+\.\d+\.\d+$", ip)
            }
            different_network = current_net not in known_nets
        except Exception:
            different_network = True

        triggered = ip_is_new and different_network
        return triggered, {
            "current_ip": current_ip,
            "known_ip_count": len(known_ips),
            "ip_is_new": ip_is_new,
            "different_network": different_network,
            "triggered": triggered,
        }

    def _check_signal_c_failed_auths(
        self, device_id: str, config: Any
    ) -> Tuple[bool, Dict[str, Any]]:
        """Signal C: > 3 failed authentication attempts in last 24 hours."""
        try:
            import psycopg2
            conn = psycopg2.connect(**config.get_db_connect_kwargs())
            cur = conn.cursor()
            since = datetime.now(timezone.utc) - timedelta(hours=24)
            cur.execute(
                """
                SELECT COUNT(*) FROM auth_logs
                WHERE device_id = %s
                  AND action IN ('login_attempt', 'mfa_attempt')
                  AND mfa_passed = false
                  AND decision = 'deny'
                  AND logged_at >= %s
                """,
                (device_id, since),
            )
            count = cur.fetchone()[0]
            cur.close()
            conn.close()
            triggered = count > MAX_FAILED_ATTEMPTS_24H
            return triggered, {
                "count": count,
                "threshold": MAX_FAILED_ATTEMPTS_24H,
                "triggered": triggered,
            }
        except Exception as exc:
            logger.warning("failed_auth_count_failed", error=str(exc))
            return False, {"error": str(exc), "triggered": False}

    def _check_signal_d_velocity(
        self,
        current_rpm: Optional[float],
        avg_requests_per_session: float,
    ) -> Tuple[bool, Dict[str, Any]]:
        """Signal D: Current request velocity > 5× historical baseline."""
        if current_rpm is None:
            return False, {"skipped": "no_current_rpm"}
        if avg_requests_per_session <= 0:
            return False, {"skipped": "no_baseline_rpm"}

        # Convert avg_requests_per_session to requests per minute
        # Baseline is requests per day / (8h session * 60 min)
        baseline_rpm = avg_requests_per_session / (8 * 60)
        if baseline_rpm <= 0:
            return False, {"skipped": "zero_baseline_rpm"}

        ratio = current_rpm / baseline_rpm
        triggered = ratio > VELOCITY_MULTIPLIER
        return triggered, {
            "current_rpm": current_rpm,
            "baseline_rpm": round(baseline_rpm, 4),
            "ratio": round(ratio, 2),
            "threshold": VELOCITY_MULTIPLIER,
            "triggered": triggered,
        }

    def _check_signal_e_device_hop(
        self, device_id: str, user_id: str, config: Any
    ) -> Tuple[bool, Dict[str, Any]]:
        """Signal E: User has simultaneous active sessions on different devices."""
        if not user_id:
            return False, {"skipped": "no_user_id"}
        try:
            import psycopg2
            conn = psycopg2.connect(**config.get_db_connect_kwargs())
            cur = conn.cursor()
            # Look for other devices for same user with active sessions in last 30 minutes
            since = datetime.now(timezone.utc) - timedelta(minutes=30)
            cur.execute(
                """
                SELECT DISTINCT device_id FROM auth_logs
                WHERE user_id = %s
                  AND device_id != %s
                  AND action = 'session_active'
                  AND decision = 'allow'
                  AND logged_at >= %s
                LIMIT 5
                """,
                (user_id, device_id, since),
            )
            other_devices = [row[0] for row in cur.fetchall()]
            cur.close()
            conn.close()
            triggered = len(other_devices) > 0
            return triggered, {
                "other_active_device_count": len(other_devices),
                "triggered": triggered,
            }
        except Exception as exc:
            logger.warning("device_hop_check_failed", error=str(exc))
            return False, {"error": str(exc), "triggered": False}


# ── Local import fix for re module used in signal B ───────────────────────
import re  # noqa: E402 — imported here to avoid circular issues with structlog init
