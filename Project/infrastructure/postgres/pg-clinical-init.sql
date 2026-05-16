-- MedTrustX — Clinical PostgreSQL Init Script
-- Instance: pg-clinical (port 5432)
-- Databases: patients_db, clinical_db, medical_records_db, diagnostics_db,
--            nursing_db, ot_db, icu_db, blood_bank_db, infection_control_db,
--            fhir_db, orthanc_db

-- ═══════════════════════════════════════════════════════════
--  Helper: Create database + service user + RLS setup
-- ═══════════════════════════════════════════════════════════
\set ON_ERROR_STOP on

-- Create databases
SELECT 'CREATE DATABASE clinical_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'clinical_db')\gexec
SELECT 'CREATE DATABASE medical_records_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'medical_records_db')\gexec
SELECT 'CREATE DATABASE diagnostics_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'diagnostics_db')\gexec
SELECT 'CREATE DATABASE nursing_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nursing_db')\gexec
SELECT 'CREATE DATABASE ot_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ot_db')\gexec
SELECT 'CREATE DATABASE icu_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'icu_db')\gexec
SELECT 'CREATE DATABASE blood_bank_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'blood_bank_db')\gexec
SELECT 'CREATE DATABASE infection_control_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'infection_control_db')\gexec
SELECT 'CREATE DATABASE fhir_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fhir_db')\gexec
SELECT 'CREATE DATABASE orthanc_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'orthanc_db')\gexec

-- Create service users (least privilege)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'patient_svc') THEN
    CREATE ROLE patient_svc LOGIN PASSWORD 'patient_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'clinical_svc') THEN
    CREATE ROLE clinical_svc LOGIN PASSWORD 'clinical_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'medrec_svc') THEN
    CREATE ROLE medrec_svc LOGIN PASSWORD 'medrec_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'diagnostics_svc') THEN
    CREATE ROLE diagnostics_svc LOGIN PASSWORD 'diagnostics_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nursing_svc') THEN
    CREATE ROLE nursing_svc LOGIN PASSWORD 'nursing_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ot_svc') THEN
    CREATE ROLE ot_svc LOGIN PASSWORD 'ot_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'icu_svc') THEN
    CREATE ROLE icu_svc LOGIN PASSWORD 'icu_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'blood_bank_svc') THEN
    CREATE ROLE blood_bank_svc LOGIN PASSWORD 'blood_bank_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'infection_ctrl_svc') THEN
    CREATE ROLE infection_ctrl_svc LOGIN PASSWORD 'infection_ctrl_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fhir_svc') THEN
    CREATE ROLE fhir_svc LOGIN PASSWORD 'fhir_svc_secret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'orthanc_svc') THEN
    CREATE ROLE orthanc_svc LOGIN PASSWORD 'orthanc_svc_secret';
  END IF;
END $$;

-- Grant connect
GRANT CONNECT ON DATABASE patients_db TO patient_svc;
GRANT CONNECT ON DATABASE clinical_db TO clinical_svc;
GRANT CONNECT ON DATABASE medical_records_db TO medrec_svc;
GRANT CONNECT ON DATABASE diagnostics_db TO diagnostics_svc;
GRANT CONNECT ON DATABASE nursing_db TO nursing_svc;
GRANT CONNECT ON DATABASE ot_db TO ot_svc;
GRANT CONNECT ON DATABASE icu_db TO icu_svc;
GRANT CONNECT ON DATABASE blood_bank_db TO blood_bank_svc;
GRANT CONNECT ON DATABASE infection_control_db TO infection_ctrl_svc;
GRANT CONNECT ON DATABASE fhir_db TO fhir_svc;
GRANT CONNECT ON DATABASE orthanc_db TO orthanc_svc;

-- ═══════════════════════════════════════════════════════════
--  Setup patients_db with RLS
-- ═══════════════════════════════════════════════════════════
\c patients_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenant isolation function
CREATE OR REPLACE FUNCTION set_tenant_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.tenant_id := current_setting('app.tenant_id', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL,
  mrn VARCHAR(32) NOT NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(16),
  blood_group VARCHAR(8),
  phone VARCHAR(20),
  email VARCHAR(256),
  address JSONB,
  emergency_contact JSONB,
  insurance_info JSONB,
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(tenant_id, mrn)
);

CREATE INDEX idx_patients_tenant ON patients(tenant_id);
CREATE INDEX idx_patients_mrn ON patients(tenant_id, mrn);
CREATE INDEX idx_patients_name ON patients(tenant_id, last_name, first_name);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON patients
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- Auto-set tenant_id on insert
CREATE TRIGGER set_patients_tenant BEFORE INSERT ON patients
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO patient_svc;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO patient_svc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO patient_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO patient_svc;

-- Audit log table (per-database)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL,
  user_id UUID,
  action VARCHAR(32) NOT NULL,
  resource_type VARCHAR(64) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_log
  USING (tenant_id = current_setting('app.tenant_id', true));
