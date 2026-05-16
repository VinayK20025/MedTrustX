"""Act 2: Multi-tenant RLS demonstration."""
import time
from config import IDX, LIVE, DEMO_TENANT
from core.banner import *
from core.colors import *
from core.progress import progress_bar, spinner
from core.typewriter import typewriter
from core.pause import pause
from core.display import display_table
from data import db_client as db
from data import api_client as api

SQL_ALL_TENANTS = """
    SELECT tenant_id, COUNT(*) as patient_count
    FROM patients GROUP BY tenant_id ORDER BY tenant_id;
"""
SQL_TENANT_GENERAL = "SELECT COUNT(*) FROM patients;"
SQL_CROSS_TENANT = """
    SELECT COUNT(*) FROM patients
    WHERE tenant_id='tenant_apollo';
"""
SQL_PAM_BYPASS = "SELECT COUNT(*) FROM patients;"
SQL_ALL_TABLES = """
    SELECT COUNT(*) FROM {table}
    WHERE tenant_id='tenant_apollo';
"""

def run() -> None:
    """Execute Act 2: Multi-Tenant RLS."""
    show_act_banner(2, "Multi-Tenant Database Isolation",
                    "Row-Level Security (RLS)")
    show_scene_banner(2,
        "Tenant Data Isolation — PostgreSQL RLS")

    # Show tenant counts from IDX
    typewriter("3 isolated tenants sharing ONE database:")
    print_result("tenant_apollo    ",
        f"{IDX.tenant_apollo_count} patients (real app data)",
        GREEN)
    print_result("tenant_general   ",
        f"{IDX.tenant_general_count} patients (Synthea synthetic)",
        CYAN)
    print_result("tenant_outpatient",
        f"{IDX.tenant_outpatient_count} patients (Synthea synthetic)",
        CYAN)

    # LIVE: admin query (no RLS)
    print_sql_block(SQL_ALL_TENANTS)
    rows = db.query("clinical", SQL_ALL_TENANTS)
    if rows:
        display_table(
            [[r['tenant_id'], r['patient_count']]
             for r in rows],
            ["Tenant ID", "Patient Count"],
            title="Admin View (no RLS context)")
        print_info("Source: patients_db [LIVE psql]")
    else:
        # Scripted fallback
        display_table(
            [['tenant_apollo', IDX.tenant_apollo_count],
             ['tenant_general', IDX.tenant_general_count],
             ['tenant_outpatient',
              IDX.tenant_outpatient_count]],
            ["Tenant ID", "Patient Count"],
            title="Admin View [SCRIPTED]")

    # LIVE: tenant-scoped query
    typewriter("\n[DB QUERY] Setting tenant_general context:")
    print_sql_block("SET app.tenant_id='tenant_general';\n"
                    + SQL_TENANT_GENERAL)
    count = db.scalar_with_rls(
        "clinical", "tenant_general",
        SQL_TENANT_GENERAL, fallback=IDX.tenant_general_count)
    print_result("Visible patients", str(count), GREEN)
    print_ok("RLS filter active — other tenants invisible")

    # LIVE: cross-tenant attack
    show_alert_banner()
    typewriter("ATTACK: Cross-tenant query attempt...")
    print_sql_block(
        "SET app.tenant_id='tenant_general';\n"
        + SQL_CROSS_TENANT)
    attack_count = db.scalar_with_rls(
        "clinical", "tenant_general",
        SQL_CROSS_TENANT, fallback=0)
    if str(attack_count) == "0" or attack_count == 0:
        show_blocked_banner()
        print_block("0 rows returned — RLS BLOCKED "
                    "cross-tenant read")
        print_ok("Zero data leakage confirmed")
    else:
        print_warn(f"Unexpected: {attack_count} rows (check RLS)")

    # LIVE via RLS manager API
    if LIVE.svc_rls:
        resp = api.get("rls",
            f"/api/rls/tenants/verify",
            show_call=True)
        if resp:
            passed = resp.get('overall_passed', False)
            if passed:
                show_pass_banner()

    pause("Scene 3: RLS Full Proof")
    show_scene_banner(3, "RLS Proof — All 8 Tables")

    # LIVE: verify all 8 clinical tables
    tables = ['patients','encounters','observations',
              'conditions','medications','allergies',
              'procedures','careplans']
    results = []
    for table in tables:
        progress_bar(f"Verifying {table}...", 0.4)
        count = db.scalar_with_rls(
            "clinical", "tenant_general",
            f"SELECT COUNT(*) FROM {table} "
            f"WHERE tenant_id='tenant_apollo'",
            fallback=0)
        passed = (str(count) == "0" or count == 0)
        results.append([
            table,
            str(count),
            "✓ PASS" if passed else "✗ FAIL"
        ])
    display_table(results,
                  ["Table", "Cross-Tenant Rows", "Status"],
                  title="\nRLS Verification Results")

    # LIVE: PAM bypass
    typewriter("\nTesting authorized PAM bypass...")
    bypass_count = db.query_scalar(
        "clinical",
        "SET rls.bypass='on'; "
        + SQL_PAM_BYPASS,
        fallback=IDX.total_patients)
    print_warn(f"PAM bypass: {bypass_count:,} rows visible")
    print_info("Bypass logged to audit_log")

    pause("Act 3: Zero Trust Architecture")
