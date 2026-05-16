# MedTrustX DHOS Simulation Suite: Technical Overview

The MedTrustX DHOS Simulation Suite is a production-grade, high-fidelity orchestration framework designed to demonstrate the security, compliance, and clinical operational maturity of the MedTrustX platform. It provides a real-time, data-driven 15-minute technical presentation using a multi-pane terminal environment.

## 🏗️ Core Architecture

### 1. The 3-Pane Orchestration (Tmux)
The simulation utilizes a sophisticated `tmux` layout to provide simultaneous visibility into multiple system layers:
*   **MAIN (Left - 60%)**: The primary narrative pane where the presentation, SQL queries, and API responses are displayed via a "typewriter" terminal effect.
*   **LOGS (Top Right - 40%)**: A live stream of the Redis Pub/Sub security events. It captures real-time ZTA alerts, breach detection incidents, and audit trail updates.
*   **METRICS (Bottom Right - 40%)**: A live dashboard that queries the PostgreSQL databases every 5 seconds, showing the real-time growth of patient records, vital observations, and security logs.

### 2. Dual-Layer "Proof of Integrity" System
Every module in the simulation is validated using a two-tier proof mechanism:
*   **Database Proof (psql)**: Direct queries to the underlying PostgreSQL instances (Clinical, IAM, Analytics) to verify row-level security, hash-chain integrity, and multi-tenant isolation.
*   **Service Proof (REST API)**: Real-time `curl` requests to the microservices (Python/FastAPI and Node.js/NestJS). This proves the application layer is correctly enforcing policies and surfacing data.

---

## 🎭 Simulation Acts (Modules)

| Act | Module | Technical Focus | Proof Method |
| :--- | :--- | :--- | :--- |
| **1** | **Ecosystem Init** | Infrastructure Discovery | Docker health checks for 70+ containers. |
| **2** | **Multi-Tenant RLS** | Row-Level Security (Postgres) | Proving that Tenant A cannot query Tenant B's data even with same credentials. |
| **3** | **ZTA Device Trust** | Zero-Trust Architecture | Real-time device attestation and trust score evaluation via ZTA-Service. |
| **4** | **Clinical FHIR R4** | Healthcare Interoperability | Fetching HL7 FHIR Patient resources from the Clinical Microservice. |
| **5** | **AI Risk Engine** | Predictive Analytics | Running readmission risk inference via the AI-Service (Python). |
| **6** | **GRC & Audit** | Compliance & Immutability | Verifying the cryptographic hash chain of the Audit-Service (Node.js). |
| **7** | **Edge Protection** | WAF & DDoS Shield | Simulating SQL injection and Rate-Limit blocks at the Kong Gateway. |

---

## 🛠️ Production-Grade Features

### 🔍 Smart Service Discovery
The simulation features a robust `live_check` engine that automatically identifies and validates health endpoints across different technology stacks:
*   **Python (FastAPI)**: Probes `/health`.
*   **Node.js (NestJS)**: Probes `/api/v1/health`.
*   **Retry Logic**: Implements a 5-second warm-up loop to ensure services starting under cold-boot don't trigger false failures.

### 🧪 Advanced API Validation
Unlike simple "print" scripts, the simulation performs rigorous backend testing:
*   **Latency Tracking**: Measures and reports real-world response times in milliseconds.
*   **Schema Verification**: Ensures the JSON payload contains mandatory fields (e.g., `id`, `trust_score`, `prediction`).
*   **Bearer Auth**: Dynamically retrieves OIDC tokens from Keycloak for every service request.

### 🧬 Zero Hardcoding (Dynamic Discovery)
The simulation is fully grounded in the live environment state. It uses SQL subqueries to dynamically fetch real MRNs, Patient IDs, and Audit Event IDs from the database to use as parameters for the API proofs. No two runs are identical.

### 📜 Comprehensive Audit Persistence
Every simulation run generates three distinct layers of proof in the `/results` directory:
1.  **`demo_summary_*.txt`**: A high-level scorecard and metrics report.
2.  **`live_logs_*.log`**: The raw Redis security event trail.
3.  **`action_log_*.txt`**: A complete, formatted transcript of every single terminal output and system interaction from the demo.

---

## 🚀 Execution Options

*   `--init`: Automatically launches the 70+ container ecosystem and cleans up orphans.
*   `--live-only`: Enforces strict production-mode testing (fails if any service is offline).
*   `--no-tmux`: Runs in a single-pane mode for standard terminal environments.
*   `--act N`: Jumps directly to a specific module for targeted demonstrations.
*   `--speed X`: Adjusts the presentation pace (e.g., `--speed 2.0` for double speed).
