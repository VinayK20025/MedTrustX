"""
MedTrustX Device Trust Agent — Central Configuration Module.

Loads all configuration from environment variables (via .env file or
system environment). All settings have typed defaults; required fields
without defaults raise ValueError on startup so misconfiguration is
caught immediately rather than at first use.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AgentConfig(BaseSettings):
    """Complete runtime configuration for the MedTrustX Device Trust Agent."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Agent Identity ─────────────────────────────────────────────────────
    agent_device_id: str = Field(
        default="",
        description="Unique device identifier assigned during registration",
    )
    agent_tenant_id: str = Field(
        default="medtrustx-default",
        description="Tenant identifier for multi-tenant deployment",
    )
    agent_version: str = Field(default="1.0.0", description="Agent version string")
    agent_mode: str = Field(
        default="native",
        description="Agent execution mode: native or browser",
    )

    # ── ZTA Service ────────────────────────────────────────────────────────
    zta_service_url: str = Field(
        default="http://zta-service:8012",
        description="Primary attestation reporting endpoint",
    )
    zta_service_cert_path: str = Field(
        default="/etc/medtrustx/certs/device.pem",
        description="mTLS client certificate for ZTA service",
    )
    zta_service_key_path: str = Field(
        default="/etc/medtrustx/certs/device.key",
        description="mTLS client private key for ZTA service",
    )
    zta_service_jwt_secret: str = Field(
        default="",
        description="JWT signing secret for device authentication",
    )
    zta_retry_attempts: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Maximum retry attempts for ZTA reporting",
    )
    zta_retry_backoff_seconds: float = Field(
        default=2.0,
        ge=0.5,
        description="Base backoff multiplier in seconds between retries",
    )

    # ── SIEM / Syslog ──────────────────────────────────────────────────────
    siem_host: str = Field(
        default="medtrust-siem",
        description="RFC 5424 UDP syslog target hostname",
    )
    siem_port: int = Field(
        default=514,
        ge=1,
        le=65535,
        description="RFC 5424 UDP syslog target port",
    )
    siem_device_vendor: str = Field(default="MedTrustX")
    siem_device_product: str = Field(default="DeviceTrustAgent")
    siem_device_version: str = Field(default="1.0")

    # ── Prometheus Pushgateway ─────────────────────────────────────────────
    prometheus_pushgateway_url: str = Field(
        default="http://pushgateway:9091",
        description="Prometheus Pushgateway URL",
    )
    prometheus_job_name: str = Field(
        default="device-trust-agent",
        description="Prometheus job name for metric grouping",
    )
    prometheus_push_interval_seconds: int = Field(
        default=60,
        ge=10,
        description="Metric push interval in seconds",
    )

    # ── OPA Policy Engine ──────────────────────────────────────────────────
    opa_service_url: str = Field(
        default="http://opa-service:8181",
        description="OPA policy engine base URL",
    )
    opa_device_data_path: str = Field(
        default="/v1/data/medtrustx/devices",
        description="OPA data path prefix for device context updates",
    )

    # ── IAM Database ───────────────────────────────────────────────────────
    iam_db_host: str = Field(default="iam-db")
    iam_db_port: int = Field(default=5432, ge=1, le=65535)
    iam_db_name: str = Field(default="iam_db")
    iam_db_user: str = Field(default="iam_agent")
    iam_db_password: str = Field(default="")
    iam_db_ssl_mode: str = Field(default="require")
    iam_db_ssl_cert: str = Field(default="/etc/medtrustx/certs/db-client.pem")
    iam_db_ssl_key: str = Field(default="/etc/medtrustx/certs/db-client.key")
    iam_db_ssl_ca: str = Field(default="/etc/medtrustx/certs/db-ca.pem")

    @property
    def iam_db_dsn(self) -> str:
        """Construct PostgreSQL DSN from component settings."""
        return (
            f"postgresql://{self.iam_db_user}:{self.iam_db_password}"
            f"@{self.iam_db_host}:{self.iam_db_port}/{self.iam_db_name}"
        )

    # ── Certificate / PKI ──────────────────────────────────────────────────
    root_ca_cert_path: str = Field(
        default="/etc/medtrustx/certs/medtrustx-root-ca.pem",
        description="Path to MedTrustX Root CA certificate",
    )
    device_cert_path: str = Field(
        default="/etc/medtrustx/certs/device.pem",
        description="Device certificate issued by MedTrustX PKI",
    )
    device_key_path: str = Field(
        default="/etc/medtrustx/certs/device.key",
        description="Device private key",
    )
    ocsp_responder_url: Optional[str] = Field(
        default=None,
        description="OCSP responder override URL; reads from cert if empty",
    )

    # ── Network Security ───────────────────────────────────────────────────
    corporate_network_cidr: str = Field(
        default="10.0.0.0/8",
        description="Corporate network CIDR (trusted range)",
    )
    approved_dns_servers: List[str] = Field(
        default=["10.0.0.53", "10.0.1.53"],
        description="Approved corporate DNS server IP addresses",
    )
    vpn_process_name: str = Field(
        default="medtrustx-vpn",
        description="VPN process name pattern",
    )
    vpn_interface_prefixes: List[str] = Field(
        default=["tun", "wg", "utun"],
        description="Network interface name prefixes that indicate VPN",
    )

    # ── On-Demand Handler ──────────────────────────────────────────────────
    on_demand_bind_host: str = Field(
        default="127.0.0.1",
        description="Local bind host for on-demand trigger server — MUST be 127.0.0.1",
    )
    on_demand_bind_port: int = Field(
        default=9099,
        ge=1024,
        le=65535,
        description="Local bind port for on-demand trigger server",
    )

    @field_validator("on_demand_bind_host")
    @classmethod
    def validate_on_demand_host(cls, v: str) -> str:
        """Enforce that on-demand handler never binds to all interfaces."""
        if v != "127.0.0.1":
            raise ValueError(
                f"on_demand_bind_host must be 127.0.0.1 for security; got '{v}'. "
                "Binding to 0.0.0.0 or any external interface is not permitted."
            )
        return v

    # ── Scheduler Intervals ────────────────────────────────────────────────
    check_interval_trusted: int = Field(
        default=120,
        ge=30,
        description="Check interval in seconds when trust level is TRUSTED",
    )
    check_interval_standard: int = Field(
        default=60,
        ge=15,
        description="Check interval in seconds when trust level is STANDARD",
    )
    check_interval_restricted: int = Field(
        default=30,
        ge=10,
        description="Check interval in seconds when trust level is RESTRICTED",
    )
    check_interval_blocked: int = Field(
        default=15,
        ge=5,
        description="Check interval in seconds when trust level is BLOCKED",
    )

    # ── Logging ────────────────────────────────────────────────────────────
    log_level: str = Field(
        default="INFO",
        description="Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL",
    )
    log_format: str = Field(
        default="json",
        description="Log output format: json or console",
    )
    log_file_path: Optional[str] = Field(
        default=None,
        description="Log file path; if None, logs to stdout only",
    )

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper = v.upper()
        if upper not in allowed:
            raise ValueError(f"log_level must be one of {allowed}; got '{v}'")
        return upper

    # ── Whitelisted Applications ───────────────────────────────────────────
    whitelisted_rat_processes: List[str] = Field(
        default=[],
        description="Process names whitelisted from unauthorized RAT detection",
    )
    whitelisted_processes: List[str] = Field(
        default=[],
        description="Additional process names whitelisted from anomaly detection",
    )

    # ── Fingerprint ────────────────────────────────────────────────────────
    device_fingerprint_hash: str = Field(
        default="",
        description="Stored device fingerprint SHA256 hash set at registration",
    )
    device_install_date: str = Field(
        default="",
        description="Agent installation timestamp in UTC ISO format",
    )

    # ── Browser Agent Cap ──────────────────────────────────────────────────
    browser_score_cap: float = Field(
        default=7.0,
        ge=0.0,
        le=10.0,
        description="Maximum trust score permitted in browser agent mode",
    )

    # ── Check Timeouts ─────────────────────────────────────────────────────
    check_default_timeout_seconds: int = Field(
        default=10,
        ge=1,
        le=60,
        description="Default individual check execution timeout in seconds",
    )
    check_max_parallel: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Maximum number of checks running concurrently",
    )

    @model_validator(mode="after")
    def validate_intervals_ordered(self) -> "AgentConfig":
        """Ensure check intervals are properly ordered by trust level urgency."""
        if not (
            self.check_interval_blocked
            < self.check_interval_restricted
            < self.check_interval_standard
            <= self.check_interval_trusted
        ):
            raise ValueError(
                "Check intervals must satisfy: blocked < restricted < standard <= trusted"
            )
        return self

    def get_db_connect_kwargs(self) -> dict:
        """Return psycopg2-compatible connection keyword arguments."""
        kwargs: dict = {
            "host": self.iam_db_host,
            "port": self.iam_db_port,
            "dbname": self.iam_db_name,
            "user": self.iam_db_user,
            "password": self.iam_db_password,
            "connect_timeout": 10,
        }
        if self.iam_db_ssl_mode != "disable":
            kwargs["sslmode"] = self.iam_db_ssl_mode
            if Path(self.iam_db_ssl_cert).exists():
                kwargs["sslcert"] = self.iam_db_ssl_cert
            if Path(self.iam_db_ssl_key).exists():
                kwargs["sslkey"] = self.iam_db_ssl_key
            if Path(self.iam_db_ssl_ca).exists():
                kwargs["sslrootcert"] = self.iam_db_ssl_ca
        return kwargs


@lru_cache(maxsize=1)
def get_config() -> AgentConfig:
    """Return cached singleton AgentConfig instance.

    Uses lru_cache so the config is loaded once per process lifetime.
    Call get_config.cache_clear() in tests to reset between test cases.
    """
    return AgentConfig()


# Module-level convenience alias
config: AgentConfig = get_config()
