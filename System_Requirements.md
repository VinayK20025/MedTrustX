# 💻 MedTrustX DHOS — System Requirements

MedTrustX is a high-performance Digital Hospital Operating System (DHOS) utilizing a dense microservices architecture. Due to the high number of parallel containers (databases, identity providers, and clinical services), the system requires significant hardware resources for stable operation.

---

## 🏗️ Hardware Requirements

### 1. Central Processing Unit (CPU)
The system runs 40+ containers in a full-stack deployment, necessitating high multi-threaded performance.
*   **Minimum**: 8 Cores / 16 Threads (e.g., Intel i7-11th Gen, AMD Ryzen 7 5000 series, or Apple M1).
*   **Recommended**: 12+ Cores (e.g., Intel i9, AMD Ryzen 9, or Apple M2 Pro/Max).
*   **Architecture**: `x86_64` or `ARM64` (Apple Silicon).

### 2. Random Access Memory (RAM)
Memory is the most critical constraint for MedTrustX.
*   **Minimum (Development)**: 16 GB (Supports Tier 1 and Tier 2 services).
*   **Recommended (Simulation/Full Stack)**: 32 GB (Required for stable multi-tenant simulations).
*   **Enterprise/Scale-Test**: 64 GB+ (For running full AI inference models alongside production infra).

### 3. Storage (Disk)
High I/O performance is required for PostgreSQL clusters and event streaming (Redpanda).
*   **Capacity**: 60 GB of free space (for Docker images, persistent volumes, and patient data).
*   **Type**: NVMe SSD highly recommended. Traditional HDDs will cause significant latency in database seeding.

---

## 🐧 Supported Operating Systems

| OS | Version | Notes |
| :--- | :--- | :--- |
| **Linux** | `Ubuntu 22.04+`, `Debian 11+`, `Fedora 38+` | **Native performance (Highly Recommended)**. |
| **macOS** | `Ventura 13.0+`, `Sonoma 14.0+` | Requires Docker Desktop with 24GB+ RAM allocated. |
| **Windows** | `Windows 11` | **Requires WSL2** (Ubuntu 22.04+ distro). Docker Desktop is required. |

---

## 🔧 Software Requirements

Ensure the following tools are installed and available in your `PATH`:

| Tool | Version | Verification Command |
| :--- | :--- | :--- |
| **Docker Engine** | `24.0.0+` | `docker --version` |
| **Docker Compose** | `V2 (2.20.0+)` | `docker compose version` |
| **Python** | `3.10` to `3.12` | `python3 --version` |
| **Node.js** | `18.x` or `20.x` | `node --version` |
| **Java (JRE)** | `11` or `17` | `java -version` |
| **GNU Make** | `4.3+` | `make --version` |
| **tmux** | `3.2+` | `tmux -V` (Required for Simulation Act orchestrator) |

---

## 🌐 Network Requirements

MedTrustX reserves a broad range of local ports. Ensure the following ranges are not occupied by other services:

*   **Infrastructure**: `5432-5438` (PostgreSQL), `6379` (Redis), `8123` (ClickHouse), `9000-9001` (MinIO).
*   **Security & IAM**: `8080` (Keycloak), `8181` (OPA), `8200` (Vault), `9443` (Step-CA).
*   **API Gateway**: `8000` (HTTP Proxy), `8443` (HTTPS Proxy), `8001` (Admin API).
*   **Messaging**: `19092` (Kafka/Redpanda), `18081` (Schema Registry).
*   **Monitoring**: `9200` (OpenSearch), `5601` (Dashboards), `3000` (Grafana), `9090` (Prometheus).

---

## 🔒 Security Requirements

1.  **Administrative Privileges**: Required for Docker operations and network port binding.
2.  **Internet Access**: Required for initial image pulls (approx. 8GB of image data) and dependency installations.
3.  **Local Loopback**: Services communicate via `localhost` and `127.0.0.1`. Ensure no firewall rules block internal traffic between containers.

---

> [!CAUTION]
> Running MedTrustX on systems with less than 16GB of RAM will likely lead to **Kernel OOM (Out of Memory) kills** and data corruption in the PostgreSQL clusters.
