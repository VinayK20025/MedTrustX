"""
Policy Fallback engine when OPA is unavailable.
"""
from typing import Dict, Any
from app.models.trust import AccessDecision

class PolicyFallbackEngine:
    def evaluate(self, context: Dict[str, Any]) -> AccessDecision:
        device = context.get("device", {})
        network = context.get("network", {})
        user = context.get("user", {})

        device_blocked = device.get("compliance_status") in ("jailbroken", "unregistered")
        network_blocked = network.get("source_ip") in ("192.168.100.100", "10.0.0.99")
        user_blocked = user.get("failed_attempts_24h", 0) >= 10 or user.get("anomaly_score", 0.0) > 0.8
        
        if device_blocked or network_blocked or user_blocked:
            return AccessDecision(
                allow=False,
                trust_score=0.0,
                step_up_required=False,
                reason="Access blocked due to critical trust degradation (Fallback Engine).",
                policy_rule="blocked_context"
            )

        device_score = 1.0 if device.get("compliance_status") == "compliant" else 0.5
        network_score = 1.0 if str(network.get("source_ip", "")).startswith("10.") else 0.5
        user_score = 1.0 if user.get("mfa_passed") and user.get("failed_attempts_24h", 0) < 3 else 0.5

        trust_score = (device_score * 0.40) + (user_score * 0.35) + (network_score * 0.25)
        
        step_up = False
        if device_score < 1.0 or network_score < 1.0 or user_score < 1.0:
            step_up = True

        return AccessDecision(
            allow=True,
            trust_score=trust_score,
            step_up_required=step_up,
            reason="Access provisionally allowed (Fallback Engine).",
            policy_rule="suspicious_context_requires_step_up" if step_up else "fully_trusted"
        )
