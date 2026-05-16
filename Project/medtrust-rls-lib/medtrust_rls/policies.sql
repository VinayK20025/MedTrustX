-- Postgres RLS Policies Setup Script for MedTrustX Services

-- Example application of RLS:
-- This is intended to be run by the database migration tool (e.g. alembic)
-- or as part of the schema initialization.

-- Enable RLS on a table (example for `patients` table):
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy to restrict SELECT based on tenant
-- CREATE POLICY tenant_isolation_select ON patients
--     FOR SELECT
--     USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Policy to restrict INSERT based on tenant
-- CREATE POLICY tenant_isolation_insert ON patients
--     FOR INSERT
--     WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- Policy to restrict UPDATE based on tenant
-- CREATE POLICY tenant_isolation_update ON patients
--     FOR UPDATE
--     USING (tenant_id = current_setting('app.current_tenant')::uuid)
--     WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- Policy to restrict DELETE based on tenant
-- CREATE POLICY tenant_isolation_delete ON patients
--     FOR DELETE
--     USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- To bypass RLS (e.g. for superadmin or background workers), set app.current_tenant to a bypass keyword
-- or use a database role with BYPASSRLS attribute.

-- Optional: Create a helper function to enforce tenant assignment on insert
CREATE OR REPLACE FUNCTION enforce_tenant_context()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('app.current_tenant', true) IS NULL OR current_setting('app.current_tenant', true) = '' THEN
        RAISE EXCEPTION 'Tenant context not set';
    END IF;
    
    NEW.tenant_id := current_setting('app.current_tenant')::uuid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
