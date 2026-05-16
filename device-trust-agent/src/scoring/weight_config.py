"""
MedTrustX Device Trust Agent — Check Weight Configuration.

Defines the weight assigned to each of the 10 security checks in the
composite trust score computation. Weights must sum to exactly 1.0 —
this is enforced by an assertion at module import time.
"""

from __future__ import annotations

from typing import Dict

# ── Check weights ──────────────────────────────────────────────────────────
# Each value represents the fraction of the composite score attributed
# to that check. All 10 values MUST sum to exactly 1.0.

WEIGHTS: Dict[int, float] = {
    1:  0.15,   # OS Patch Level
    2:  0.15,   # Antivirus / EDR Status
    3:  0.10,   # Disk Encryption
    4:  0.08,   # Firewall Status
    5:  0.10,   # Screen Lock & Authentication
    6:  0.12,   # Jailbreak / Root Detection
    7:  0.10,   # Certificate & Identity Validity
    8:  0.08,   # Network Security Posture
    9:  0.07,   # Process Integrity
    10: 0.05,   # Behavioral Anomaly Score
}

# Enforce weights sum to exactly 1.0 at import time
_WEIGHT_SUM = round(sum(WEIGHTS.values()), 10)
assert _WEIGHT_SUM == 1.0, (
    f"Check weights must sum to exactly 1.0, but sum is {_WEIGHT_SUM}. "
    f"Individual weights: {WEIGHTS}"
)

# ── Check metadata ─────────────────────────────────────────────────────────
# Human-readable names for each check_id — used in CEF syslog and OPA docs.

CHECK_NAMES: Dict[int, str] = {
    1:  "OS Patch Level",
    2:  "Antivirus / EDR Status",
    3:  "Disk Encryption",
    4:  "Firewall Status",
    5:  "Screen Lock & Authentication",
    6:  "Jailbreak / Root Detection",
    7:  "Certificate & Identity Validity",
    8:  "Network Security Posture",
    9:  "Process Integrity",
    10: "Behavioral Anomaly Score",
}

# OPA data document key names (snake_case, matches access_decision.rego)
CHECK_OPA_KEYS: Dict[int, str] = {
    1:  "os_patch",
    2:  "antivirus",
    3:  "disk_encryption",
    4:  "firewall",
    5:  "screen_lock",
    6:  "jailbreak",
    7:  "certificate",
    8:  "network",
    9:  "processes",
    10: "behavioral",
}

# Checks whose score of 1.0 triggers an IMMEDIATE BLOCK override
IMMEDIATE_BLOCK_CHECK_IDS = frozenset({6, 7, 9})

# Minimum passing score for any individual check (used for reporting)
PASSING_SCORE_THRESHOLD = 6.0


def get_weight(check_id: int) -> float:
    """Return the weight for a given check_id.

    Args:
        check_id: Integer 1–10 identifying the check.

    Returns:
        The weight as a float in (0.0, 1.0].

    Raises:
        KeyError: If check_id is not in 1–10.
    """
    return WEIGHTS[check_id]


def get_check_name(check_id: int) -> str:
    """Return the human-readable name for a given check_id."""
    return CHECK_NAMES[check_id]


def get_opa_key(check_id: int) -> str:
    """Return the OPA document key name for a given check_id."""
    return CHECK_OPA_KEYS[check_id]
