DO $$
DECLARE
    tname text;
    tables text[] := ARRAY['appointments', 'consent_registry', 'access_review_snapshots', 'api_request_logs', 'threat_logs', 'otel_traces'];
BEGIN
    FOREACH tname IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_uuid UUID', tname);
        
        EXECUTE format('UPDATE %I SET tenant_uuid = %L::uuid WHERE tenant_id = %L', tname, 'e540de79-f14e-51c6-a6fc-fdf5b103e687', 'tenant_apollo');
        EXECUTE format('UPDATE %I SET tenant_uuid = %L::uuid WHERE tenant_id = %L', tname, '9450c26c-d102-5ea8-b57f-7dc96e812d4a', 'tenant_general');
        EXECUTE format('UPDATE %I SET tenant_uuid = %L::uuid WHERE tenant_id = %L', tname, 'd9de7d23-7a91-5ba4-8588-46633b497497', 'tenant_outpatient');
        
        EXECUTE format('ALTER TABLE %I RENAME COLUMN tenant_id TO tenant_id_legacy', tname);
        EXECUTE format('ALTER TABLE %I RENAME COLUMN tenant_uuid TO tenant_id', tname);
        EXECUTE format('ALTER TABLE %I ALTER COLUMN tenant_id SET NOT NULL', tname);
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_tenant_uuid ON %I(tenant_id)', tname, tname);
    END LOOP;
END $$;
