# Gateway Threat Model

- **DDoS**: Thwarted by Redis-backed adaptive rate limiting and Kong global thresholds.
- **Credential Stuffing**: Mitigated by AI anomaly detection in `threat_intelligence.py` looking for repeated auth failures.
- **SQLi / XSS**: Dropped at the edge via Kong Lua WAF rules.
- **Token Theft**: Mitigated using Post-Quantum Cryptography (PQC) hybrid session keys validated at every layer.
