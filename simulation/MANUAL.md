# MedTrustX DHOS Terminal Simulation — User Manual

## 1. Overview
The MedTrustX DHOS Simulation is a high-fidelity, interactive terminal-based presentation tool designed to demonstrate the 6 core modules of the Digital Hospital Operating System and the Device Trust Agent. It uses a multi-pane `tmux` environment to show live execution, security logs, and database metrics simultaneously.

## 2. Prerequisites
- **Terminal Size**: Minimum **220x50** characters (required for the 3-pane tmux layout).
- **Dependencies**: `tmux`, `psql`, `redis-cli`, `jq`, `bc`, `curl`, `docker`.
- **Environment**: Must be run from the `/root/MedTrustX` directory.

## 3. Quick Start
To launch the full simulation:
```bash
cd /root/MedTrustX
./simulation/run.sh
```

## 4. Interactive Controls
- **Advance Scene**: Press **ENTER** whenever prompted in the main (left) pane.
- **Exit Simulation**: The simulation will automatically clean up `tmux` upon completion. To exit early, use `Ctrl+C` in the main pane and then press any key to close tmux.

## 5. Execution Modes
The simulation automatically detects if backend services are live.
- **LIVE MODE**: If services (ZTA, IAM, AI, etc.) are running, the script makes real API and DB calls.
- **SCRIPTED MODE**: If services are offline, the script replays high-fidelity pre-recorded output that is indistinguishable from live data.

### Forced Modes
- `--live-only`: Force the simulation to exit if any required service is offline.
- `--scripted-only`: Force the use of pre-recorded fallback data even if services are online.

## 6. Advanced CLI Options
| Option | Example | Description |
| :--- | :--- | :--- |
| `--init` | `--init` | **New**: Automatically starts all Docker containers before simulation. |
| `--act N` | `--act 3` | Skip directly to Act N (1-7). |
| `--speed FLOAT` | `--speed 2.0` | Double the speed of typewriter and animation effects. |
| `--no-tmux` | `--no-tmux` | Run in a single terminal window without side panes. |

## 7. The 7 Acts of MedTrustX
1. **Act 1: Startup**: Infrastructure health check and dataset inventory.
2. **Act 2: Multi-Tenant RLS**: Demonstrates row-level isolation and PAM bypass.
3. **Act 3: ZTA & Device Trust**: 10-check device attestation and jailbreak blocking.
4. **Act 4: Clinical Core**: Patient record access, vitals history, and CDS interaction checks.
5. **Act 5: AI Engine**: Readmission risk prediction with SHAP explainability.
6. **Act 6: GRC & Audit**: Immutable hash-chain verification and compliance scorecard.
7. **Act 7: API Gateway**: DDoS protection, WAF SQLi blocking, and distributed tracing.

## 8. Layout Reference
- **Main Pane (Left)**: The primary presentation and interaction area.
- **Logs Pane (Top Right)**: Real-time security events from Redis Pub/Sub.
- **Metrics Pane (Bottom Right)**: Live counters for Patients, Vitals, and API Requests.

## 10. Viewing Results
After the simulation completes (or if interrupted), a summary report is automatically generated in the following directory:
- **Path**: `/root/MedTrustX/simulation/results/`
- **Format**: `demo_summary_YYYYMMDD_HHMMSS.txt`

This file contains the final scorecard, timestamp, and a summary of all demonstrated modules.
