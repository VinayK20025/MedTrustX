# MedTrustX Device Trust Agent

Zero Trust endpoint attestation for **MedTrustX DHOS** (Digital Health Operating System).

The agent runs **10 security checks** every 15–120 seconds (adaptive interval), computes a weighted composite trust score, classifies the device into a trust tier, enforces access policy, and reports to four targets simultaneously:

| Target | Protocol | Purpose |
|---|---|---|
| **zta-service** | HTTPS + JWT + mTLS | Policy enforcement |
| **SIEM (Splunk)** | CEF/UDP RFC 5424 | Security event logging |
| **Prometheus Pushgateway** | HTTP PUT | Metrics / alerting |
| **OPA** | HTTP PUT | Policy data store |

---

## Trust Tiers

| Score | Level | Access |
|---|---|---|
| 0.0 – 3.0 | **BLOCKED** | No access |
| 3.1 – 6.0 | **RESTRICTED** | Read-only clinical data |
| 6.1 – 8.5 | **STANDARD** | Read + write clinical data |
| 8.6 – 10.0 | **TRUSTED** | Full access incl. export & admin |

Check IDs **6** (Jailbreak), **7** (Certificate), and **9** (Process Integrity) are **critical**: a score of 1 on any of them sets the composite score to 0.0 (BLOCKED), regardless of other checks.

---

## Security Checks

| ID | Check | Weight | Immediate Block |
|---|---|---|---|
| 1 | OS Patch Level | 0.15 | No |
| 2 | Antivirus / EDR | 0.15 | No |
| 3 | Disk Encryption | 0.10 | No |
| 4 | Firewall | 0.08 | No |
| 5 | Screen Lock | 0.10 | No |
| 6 | Jailbreak / Root / SIP | 0.12 | **Yes** |
| 7 | Device Certificate | 0.10 | **Yes** |
| 8 | Network Security | 0.08 | No |
| 9 | Process Integrity | 0.07 | **Yes** |
| 10 | Behavioral Anomaly | 0.05 | No |

---

## Platforms

| Platform | Daemon Mode | Notes |
|---|---|---|
| **Linux** | systemd (`Type=notify`) | WATCHDOG=30s, sd_notify |
| **macOS** | LaunchDaemon | `RunAtLoad`, `KeepAlive` |
| **Windows** | Windows Service | `win32serviceutil`, auto-restart |
| **iOS** | Browser agent | Checks 1, 6, 7, 8, 10 available |
| **Android** | Browser agent | Checks 1, 3, 6, 8, 10 available |
| **Browser** | Web Worker | Score capped at 7.0 |

---

## Installation

### Linux

```bash
# 1. Copy the binary and config
sudo cp medtrustx-agent      /usr/local/bin/
sudo cp agent.env            /etc/medtrustx/
sudo cp medtrustx-agent.service /etc/systemd/system/

# 2. Create service user and directories
sudo useradd --system --no-create-home --shell /usr/sbin/nologin medtrustx
sudo mkdir -p /var/log/medtrustx
sudo chown medtrustx:medtrustx /var/log/medtrustx

# 3. Configure
sudo nano /etc/medtrustx/agent.env

# 4. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable --now medtrustx-agent

# OR use the installer script (handles all of the above):
sudo ./install/linux/install.sh install
```

**Status and logs:**
```bash
systemctl status medtrustx-agent
journalctl -u medtrustx-agent -f
```

---

### macOS

```bash
# Option A — installer script (recommended):
sudo ./install/macos/install.sh install

# Option B — manual:
sudo cp medtrustx-agent /usr/local/bin/
sudo cp install/macos/com.medtrustx.agent.plist /Library/LaunchDaemons/
sudo launchctl bootstrap system /Library/LaunchDaemons/com.medtrustx.agent.plist
```

**Status and logs:**
```bash
launchctl list com.medtrustx.agent
tail -f /var/log/medtrustx/agent.log
```

---

### Windows

**Option A — MSI installer (recommended):**
```powershell
# Build MSI (requires WiX Toolset v4):
wix build install\windows\medtrustx-agent.wxs `
    -d ProductVersion=1.0.0 `
    -d AgentExe=dist\medtrustx-agent.exe `
    -o dist\medtrustx-agent-1.0.0.msi

# Install:
msiexec /i dist\medtrustx-agent-1.0.0.msi /quiet
```

**Option B — PowerShell installer:**
```powershell
# Run as Administrator:
.\install\windows\install.ps1 install
```

**Status and logs:**
```powershell
.\install\windows\install.ps1 status
Get-Content "C:\ProgramData\MedTrustX\Agent\logs\agent.log" -Wait -Tail 50
```

---

## Configuration

Copy `.env.example` to `agent.env` and set the required variables:

```bash
cp .env.example agent.env
```

### Required variables

| Variable | Description | Example |
|---|---|---|
| `AGENT_DEVICE_ID` | Unique device UUID | `d1234567-...` |
| `AGENT_TENANT_ID` | Tenant UUID | `t1234567-...` |
| `ZTA_SERVICE_URL` | ZTA service HTTPS endpoint | `https://zta.company.com` |
| `ZTA_JWT_SECRET` | HS256 JWT signing secret (32+ chars) | `changeme-...` |

### Optional variables

| Variable | Default | Description |
|---|---|---|
| `AGENT_MODE` | `native` | `native` or `browser` |
| `AGENT_LOG_LEVEL` | `INFO` | `DEBUG`/`INFO`/`WARNING`/`ERROR` |
| `AGENT_LOG_FORMAT` | `json` | `json` or `console` |
| `SIEM_HOST` | `127.0.0.1` | SIEM UDP syslog host |
| `SIEM_PORT` | `514` | SIEM UDP port |
| `PROMETHEUS_PUSHGATEWAY_URL` | — | Prometheus Pushgateway base URL |
| `OPA_SERVICE_URL` | — | OPA data API base URL |
| `IAM_DB_HOST` | `localhost` | PostgreSQL host for behavioral check |
| `IAM_DB_PORT` | `5432` | PostgreSQL port |
| `IAM_DB_NAME` | `iam_db` | Database name |
| `IAM_DB_USER` | `iam_reader` | Database user |
| `IAM_DB_PASSWORD` | — | Database password |
| `ON_DEMAND_BIND_HOST` | `127.0.0.1` | On-demand HTTP server bind host **(must be 127.0.0.1)** |
| `ON_DEMAND_BIND_PORT` | `9099` | On-demand HTTP server port |
| `DEVICE_CERT_PATH` | — | Path to device TLS certificate (PEM) |
| `DEVICE_KEY_PATH` | — | Path to device private key (PEM) |
| `CA_BUNDLE_PATH` | — | CA bundle for mTLS verification |

---

## Building from Source

### Prerequisites

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Run locally

```bash
# Start in foreground (console logging):
medtrustx-agent run --foreground --log-format console

# Or directly:
python -m src.main run --foreground --log-format console
```

### Run a single check

```bash
medtrustx-agent check 1   # OS Patch
medtrustx-agent check 7   # Certificate
medtrustx-agent check 9   # Process Integrity
```

### Build executables

```bash
# Linux:
./build/build_linux.sh

# macOS:
./build/build_macos.sh

# Windows (PowerShell):
.\build\build_windows.ps1
```

---

## Tests

```bash
# Run all tests:
pytest

# With coverage:
pytest --cov=src --cov-report=term-missing

# Run a specific check test:
pytest tests/test_check_07_certificate.py -v

# Run only fast unit tests (exclude integration tests that need DB):
pytest -m "not integration"
```

---

## On-Demand HTTP API

The agent binds a local HTTP server on `127.0.0.1:9099` (loopback only):

| Method | Path | Description |
|---|---|---|
| `POST` | `/attest` | Run all 10 checks immediately |
| `POST` | `/attest/check/{id}` | Run single check by ID (1–10) |
| `GET` | `/status` | Return last cached TrustReport |
| `GET` | `/version` | Return agent version + platform info |
| `GET` | `/health` | Liveness check |

Example:
```bash
# Trigger full attestation:
curl -s -X POST http://127.0.0.1:9099/attest | jq .

# Run check 9 (Process Integrity):
curl -s -X POST http://127.0.0.1:9099/attest/check/9 | jq .
```

---

## Browser Agent

The browser-agent fallback runs in a **Web Worker** and performs a subset of checks using browser-available APIs:

- **OS Patch** (User-Agent parsing) — max score 7
- **Certificate** (WebCrypto ECDSA ephemeral key, POST to `/api/zta/browser-verify`)
- **Network** (WebRTC ICE IP, DNS latency)
- **Behavioral** (localStorage login-time/failure counters)
- **Fingerprint** (OffscreenCanvas SHA-256)

Composite score is **capped at 7.0** — devices using only the browser agent cannot reach TRUSTED tier.

To inject the loader:
```html
<iframe
  src="https://zta.company.com/medtrustx/loader.html"
  style="display:none"
  sandbox="allow-scripts allow-same-origin">
</iframe>
```

---

## Architecture

```
medtrustx-agent
├── src/
│   ├── main.py                     CLI entry point
│   ├── config.py                   Pydantic settings (env-based)
│   ├── platform_detector.py        OS/platform detection
│   ├── checks/                     10 security check modules
│   ├── scoring/                    Score engine + override rules + access policy
│   ├── attestation/                Device fingerprint + certificate + signing
│   ├── reporting/                  ZTA / SIEM / Prometheus / OPA reporters
│   ├── scheduler/                  ContinuousScheduler + OnDemandHandler
│   ├── daemon/                     Linux/macOS/Windows daemon lifecycle
│   └── models/                     TrustLevel / CheckResult / TrustReport
├── browser-agent/
│   ├── checks.js                   Browser-side check implementations
│   ├── reporter.js                 POST to /api/zta/browser-attest
│   ├── agent.js                    Web Worker orchestrator
│   └── loader.html                 Hidden iframe bootstrap page
├── build/                          Platform build scripts
├── install/                        Platform installer scripts + config
└── tests/                          pytest test suite
```

---

## Security Notes

- The on-demand HTTP server **must** bind to `127.0.0.1` only (enforced by config validator).
- Device private keys are read with a permissions check; world-readable keys generate a warning.
- JWT tokens expire after **5 minutes**; mTLS is used in addition to JWT for ZTA reporter calls.
- CEF syslog messages are truncated to **1024 bytes** for safe UDP transmission.
- The behavioral check gracefully degrades to score **5.0** when the IAM database is unreachable.
- Browser agent scores are hard-capped at **7.0** regardless of individual check results.

---

## License

Copyright © 2024 MedTrustX. All rights reserved. Proprietary and confidential.
