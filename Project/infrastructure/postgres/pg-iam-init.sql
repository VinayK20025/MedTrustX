-- MedTrustX — IAM PostgreSQL Init Script
-- Instance: pg-iam (port 5434)
-- Databases: iam_db, audit_db, compliance_db, legal_db, zta_db,
--            keycloak_db, threat_db, kong_db, gitea_db, sonarqube_db

\set ON_ERROR_STOP on

SELECT 'CREATE DATABASE audit_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'audit_db')\gexec
SELECT 'CREATE DATABASE compliance_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'compliance_db')\gexec
SELECT 'CREATE DATABASE legal_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'legal_db')\gexec
SELECT 'CREATE DATABASE zta_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'zta_db')\gexec
SELECT 'CREATE DATABASE keycloak_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak_db')\gexec
SELECT 'CREATE DATABASE threat_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'threat_db')\gexec
SELECT 'CREATE DATABASE kong_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kong_db')\gexec
SELECT 'CREATE DATABASE gitea_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gitea_db')\gexec
SELECT 'CREATE DATABASE sonarqube_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sonarqube_db')\gexec

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'iam_svc') THEN CREATE ROLE iam_svc LOGIN PASSWORD 'iam_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'audit_svc') THEN CREATE ROLE audit_svc LOGIN PASSWORD 'audit_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'compliance_svc') THEN CREATE ROLE compliance_svc LOGIN PASSWORD 'compliance_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'legal_svc') THEN CREATE ROLE legal_svc LOGIN PASSWORD 'legal_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'zta_svc') THEN CREATE ROLE zta_svc LOGIN PASSWORD 'zta_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'keycloak_user') THEN CREATE ROLE keycloak_user LOGIN PASSWORD 'keycloak_db_secret_2026'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'threat_svc') THEN CREATE ROLE threat_svc LOGIN PASSWORD 'threat_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'kong_user') THEN CREATE ROLE kong_user LOGIN PASSWORD 'kong_db_secret_2026'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gitea_svc') THEN CREATE ROLE gitea_svc LOGIN PASSWORD 'gitea_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sonarqube_svc') THEN CREATE ROLE sonarqube_svc LOGIN PASSWORD 'sonarqube_svc_secret'; END IF;
END $$;

GRANT CONNECT ON DATABASE iam_db TO iam_svc;
GRANT CONNECT ON DATABASE audit_db TO audit_svc;
GRANT CONNECT ON DATABASE compliance_db TO compliance_svc;
GRANT CONNECT ON DATABASE legal_db TO legal_svc;
GRANT CONNECT ON DATABASE zta_db TO zta_svc;
GRANT CONNECT ON DATABASE keycloak_db TO keycloak_user;
GRANT CONNECT ON DATABASE threat_db TO threat_svc;
GRANT CONNECT ON DATABASE kong_db TO kong_user;
GRANT CONNECT ON DATABASE gitea_db TO gitea_svc;
GRANT CONNECT ON DATABASE sonarqube_db TO sonarqube_svc;

-- Grant full ownership for Keycloak/Kong (they manage their own schemas)
ALTER DATABASE keycloak_db OWNER TO keycloak_user;
ALTER DATABASE kong_db OWNER TO kong_user;
ALTER DATABASE gitea_db OWNER TO gitea_svc;
ALTER DATABASE sonarqube_db OWNER TO sonarqube_svc;

-- Setup iam_db with RLS
\c iam_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_tenant_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.tenant_id := current_setting('app.tenant_id', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- IAM roles/permissions table
CREATE TABLE IF NOT EXISTS iam_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL,
  role_name VARCHAR(128) NOT NULL,
  role_category VARCHAR(64) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, role_name)
);

ALTER TABLE iam_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON iam_roles
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

GRANT USAGE ON SCHEMA public TO iam_svc;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iam_svc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO iam_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO iam_svc;

-- Setup audit_db (immutable append-only)
\c audit_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_id UUID,
  actor_type VARCHAR(32),
  action VARCHAR(64) NOT NULL,
  resource_type VARCHAR(128) NOT NULL,
  resource_id VARCHAR(256),
  outcome VARCHAR(16) NOT NULL DEFAULT 'success',
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  risk_score DECIMAL(5,2),
  session_id UUID
);

CREATE INDEX idx_audit_tenant_time ON audit_events(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_events(tenant_id, actor_id);
CREATE INDEX idx_audit_resource ON audit_events(tenant_id, resource_type, resource_id);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_events
  USING (tenant_id = current_setting('app.tenant_id', true));

-- Prevent updates/deletes (immutable)
CREATE OR REPLACE FUNCTION prevent_modification() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable — modification not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION prevent_modification();

GRANT USAGE ON SCHEMA public TO audit_svc;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA public TO audit_svc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO audit_svc;
