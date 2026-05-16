# MedTrustX Vault Configuration (Dev Mode)
storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1  # Dev mode — enable TLS in production
}

api_addr = "http://0.0.0.0:8200"
cluster_addr = "https://0.0.0.0:8201"

ui = true
disable_mlock = true

# Audit logging
audit {
  type = "file"
  path = "file"
  options = {
    file_path = "/vault/logs/audit.log"
  }
}

# Default lease TTL
default_lease_ttl = "768h"
max_lease_ttl = "8760h"
