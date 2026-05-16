# MedTrustX Digital Hospital Operating System (DHOS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: DHOS](https://img.shields.io/badge/Stack-DHOS-blue.svg)](#)
[![Security: Zero Trust](https://img.shields.io/badge/Security-Zero_Trust-green.svg)](#)
[![AI: Explainable](https://img.shields.io/badge/AI-Explainable-orange.svg)](#)

MedTrustX is a state-of-the-art **Digital Hospital Operating System (DHOS)** designed for modern, secure, and data-driven healthcare environments. It integrates a multi-layered **Zero Trust Architecture (ZTA)**, AI-driven clinical intelligence, and a comprehensive microservices ecosystem to provide a unified platform for hospital operations, patient care, and compliance.

---

## 🏗️ Architectural Overview

MedTrustX is built on a modular, containerized architecture that ensures high availability, security, and scalability.

### Core Modules
1.  **Zero Trust Security (ZTA & IAM)**: Implements 10-point device attestation, jailbreak detection, and identity-aware access control using **Keycloak**, **Open Policy Agent (OPA)**, and **HashiCorp Vault**.
2.  **Clinical Core**: Centralized management of patient records, vitals, and diagnostics with **Row-Level Security (RLS)** for multi-tenant isolation.
3.  **AI Inference Engine**: Predicts patient readmission risks and clinical outcomes with **SHAP explainability**, integrated into the clinical workflow.
4.  **GRC & Audit**: Automated Governance, Risk, and Compliance tracking with an immutable audit trail using hash-chain verification.
5.  **API Composition Gateway**: High-performance entry point using **Kong Gateway** for distributed tracing, DDoS protection, and WAF capabilities.
6.  **Operational Microservices**: Specialized services for HR, Billing, Inventory, Pharmacy, and ICU management.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Next.js |
| **Backend** | Python (FastAPI), Node.js (NestJS) |
| **Data Layer** | PostgreSQL (RLS), Redis, ClickHouse, MinIO, Redpanda |
| **Security** | Keycloak, OPA, HashiCorp Vault, Step-CA |
| **Gateway** | Kong Gateway, GraphQL Federation |
| **Infrastructure** | Docker, Docker Compose, Nginx |
| **Monitoring** | OpenSearch, Prometheus, Grafana |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Terminal with `tmux` (for simulation)
- [System Requirements](System_Requirements.md)
- [Detailed Environment Setup Guide](VENV_Setup.md)

### 1. Clone and Initialize
```bash
git clone https://github.com/VinayK20025/MedTrustX.git
cd MedTrustX
```

### 2. Launch Infrastructure
Start all backend microservices and data layers:
```bash
cd Project
# Initialize environment if necessary
cp .env.example .env
docker-compose up -d
```

### 3. Run Simulation
MedTrustX includes a high-fidelity **Terminal Simulation Suite** to demonstrate system capabilities across 7 interactive acts.
```bash
./simulation/run.sh
```

---

## 🎭 Simulation Acts
The simulation demonstrates the system's request lifecycle and security posture:
- **Act 1: Startup**: System-wide health checks.
- **Act 2: Multi-Tenant RLS**: Cross-tenant data isolation.
- **Act 3: ZTA & Device Trust**: Secure device attestation.
- **Act 4: Clinical Core**: Real-time vitals and records.
- **Act 5: AI Engine**: Predictive risk analytics.
- **Act 6: GRC & Audit**: Compliance verification.
- **Act 7: API Gateway**: Traffic management and security.

---

## 📂 Repository Structure
- `/Project`: Core microservices, frontend, and infrastructure configuration.
- `/simulation`: Presentation suite and automated demonstration scripts.
- `/device-trust-agent`: Source code for the ZTA device attestation agent.
- `seed_*.py`: Data population scripts for various system modules.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
**MedTrustX** — *Securing the Future of Digital Healthcare.*
