import pytest
from sqlalchemy import text

pytestmark = pytest.mark.asyncio

TENANT_APOLLO = "e540de79-f14e-51c6-a6fc-fdf5b103e687"
TENANT_GENERAL = "9450c26c-d102-5ea8-b57f-7dc96e812d4a"

async def test_tenant_general_cannot_see_tenant_apollo_patients(clinical_session):
    await clinical_session.execute(text("SET LOCAL rls.bypass = 'off'"))
    await clinical_session.execute(text(f"SET LOCAL app.tenant_id = '{TENANT_GENERAL}'"))
    
    res = await clinical_session.execute(text(f"SELECT COUNT(*) FROM patients WHERE tenant_id = '{TENANT_APOLLO}'::uuid"))
    count = res.scalar()
    
    assert count == 0, "tenant_general should see 0 patients belonging to tenant_apollo"

async def test_tenant_apollo_sees_only_5_patients(clinical_session):
    await clinical_session.execute(text("SET LOCAL rls.bypass = 'off'"))
    await clinical_session.execute(text(f"SET LOCAL app.tenant_id = '{TENANT_APOLLO}'"))
    
    res = await clinical_session.execute(text("SELECT COUNT(*) FROM patients"))
    count = res.scalar()
    
    assert count == 5, f"tenant_apollo should see exactly 5 patients, saw {count}"

async def test_cross_tenant_blocked_on_all_tables(clinical_session, operational_session):
    tables_clinical = [
        "patients", "encounters", "observations", "conditions", 
        "medications", "allergies", "procedures", "careplans", "audit_log"
    ]
    
    await clinical_session.execute(text("SET LOCAL rls.bypass = 'off'"))
    await clinical_session.execute(text(f"SET LOCAL app.tenant_id = '{TENANT_GENERAL}'"))
    
    for table in tables_clinical:
        res = await clinical_session.execute(text(f"SELECT COUNT(*) FROM {table} WHERE tenant_id = '{TENANT_APOLLO}'::uuid"))
        assert res.scalar() == 0, f"Cross-tenant access not blocked on clinical table {table}"

    tables_operational = [
        "appointments", "consent_registry", "access_review_snapshots", 
        "api_request_logs", "threat_logs", "otel_traces"
    ]
    
    await operational_session.execute(text("SET LOCAL rls.bypass = 'off'"))
    await operational_session.execute(text(f"SET LOCAL app.tenant_id = '{TENANT_GENERAL}'"))
    
    for table in tables_operational:
        res = await operational_session.execute(text(f"SELECT COUNT(*) FROM {table} WHERE tenant_id = '{TENANT_APOLLO}'::uuid"))
        assert res.scalar() == 0, f"Cross-tenant access not blocked on operational table {table}"

async def test_privileged_bypass_sees_all_patients(clinical_session):
    await clinical_session.execute(text("SET LOCAL rls.bypass = 'on'"))
    
    res = await clinical_session.execute(text("SELECT COUNT(*) FROM patients"))
    count = res.scalar()
    
    assert count == 1005, f"Bypass should see all 1005 patients, saw {count}"

async def test_force_rls_applies_to_table_owner(clinical_session):
    await clinical_session.execute(text("SET LOCAL rls.bypass = 'off'"))
    await clinical_session.execute(text("SET LOCAL app.tenant_id = '00000000-0000-0000-0000-000000000000'"))
    
    res = await clinical_session.execute(text("SELECT COUNT(*) FROM patients"))
    count = res.scalar()
    
    assert count == 0, f"Owner should be filtered by FORCE RLS, saw {count}"
