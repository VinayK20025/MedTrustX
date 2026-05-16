# 🛠️ MedTrustX DHOS — Environment Setup Guide

This document outlines the configuration of virtual environments and dependency management for the MedTrustX Digital Hospital Operating System (DHOS).

---

## 📋 System Prerequisites

Before setting up the environments, ensure your host system has the following installed:

| Component | Minimum Version | Purpose |
| :--- | :--- | :--- |
| **Hardware** | See [Requirements](System_Requirements.md) | CPU/RAM/Storage specs for stable operation. |
| **Python** | `3.10+` | Root scripts, simulation suite, and microservices logic. |
| **Docker** | `24.0.0+` | Container orchestration for all infrastructure and services. |
| **Docker Compose** | `V2` | Managing multi-container deployments. |
| **Node.js** | `18.x (LTS)` | Frontend dashboard and NestJS-based operational services. |
| **Java (JRE)** | `11+` | Required for running the Synthea patient data generator. |
| **Make** | `GNU Make` | Utility for running project automation commands. |

---

## 🐍 1. Root Environment Setup

The root directory contains seeding scripts (`seed_*.py`) used to populate the databases with synthetic data, AI training sets, and ZTA policies.

### Create and Activate Virtual Environment
```bash
# Navigate to project root
cd MedTrustX

# Create virtual environment
python3 -m venv .venv

# Activate environment
source .venv/bin/activate  # Linux/macOS
# .\.venv\Scripts\activate  # Windows
```

### Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 🎭 2. Simulation Suite Environment

The `simulation/` directory contains a standalone suite for demonstrating the DHOS capabilities across different "Acts" (Clinical, Operational, Security).

### Setup Steps
```bash
# Navigate to simulation directory
cd simulation

# Create virtual environment
python3 -m venv .venv

# Activate environment
source .venv/bin/activate

# Install simulation-specific requirements
pip install -r requirements.txt
```

---

## 🐳 3. Microservices & Infrastructure (Docker)

Most MedTrustX components are containerized. You do not need to manually create virtual environments for individual microservices unless you are developing them outside of Docker.

### Building Containers
Dependencies for microservices (FastAPI/Python, NestJS/Node.js) are defined in their respective `Dockerfile` and `requirements.txt`/`package.json` files and are installed during the build process.

```bash
# From the Project directory
cd Project

# Build all service images (installs all internal dependencies)
make build
```

### Dependency Locations
If you need to audit or update dependencies for a specific service:
- **Python Services**: `Project/<service-name>/requirements.txt`
- **Node.js Services**: `Project/<service-name>/package.json`

---

## 📊 Dependency Summary

| Environment | Config File | Key Packages |
| :--- | :--- | :--- |
| **Root (Seeding)** | `requirements.txt` | `pandas`, `sqlalchemy`, `psycopg2-binary`, `numpy` |
| **Simulation** | `simulation/requirements.txt` | `requests`, `redis`, `colorama`, `tabulate` |
| **Backend Services** | Individual `requirements.txt` | `fastapi`, `uvicorn`, `pydantic`, `sqlalchemy` |
| **Frontend** | `Project/frontend/package.json` | `react`, `typescript`, `recharts`, `axios` |

---

## ⚠️ Troubleshooting

1. **Psycopg2 Installation Failures**: Ensure `libpq-dev` (Linux) or Postgres CLI tools (macOS) are installed on your host, as `psycopg2-binary` compiles against them.
2. **Docker Permission Denied**: Ensure your user is in the `docker` group or run commands with `sudo`.
3. **Port Conflicts**: MedTrustX uses a wide range of ports (5432-5438 for DBs, 8000-9000 for services). Ensure these are free before starting the stack.

---

> [!TIP]
> Always ensure your virtual environment is activated (`source .venv/bin/activate`) before running any Python scripts to avoid `ModuleNotFoundError`.
