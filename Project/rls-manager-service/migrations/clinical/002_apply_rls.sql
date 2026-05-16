DO $$
DECLARE
    tname text;
    tables text[] := ARRAY['patients', 'encounters', 'observations', 'conditions', 'medications', 'allergies', 'procedures', 'careplans', 'audit_log'];
BEGIN
    FOREACH tname IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tname);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tname);
        
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tname);
        
        EXECUTE format('
            CREATE POLICY tenant_isolation ON %I
            AS RESTRICTIVE
            USING (
                tenant_id = current_setting(''app.tenant_id'', true)::uuid
                OR current_setting(''rls.bypass'', true) = ''on''
            )
            WITH CHECK (
                tenant_id = current_setting(''app.tenant_id'', true)::uuid
            )
        ', tname);
    END LOOP;
END $$;
