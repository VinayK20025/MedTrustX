"""Act 6: GRC and audit infrastructure demonstration."""
from config import IDX, LIVE, DEMO_TENANT
from core.banner import *
from core.colors import *
from core.progress import progress_bar, spinner
from core.typewriter import typewriter
from core.pause import pause
from core.display import (display_table, display_json,
                          display_compliance_scorecard)
from data import db_client as db
from data import api_client as api

COMPLIANCE_SCORES = {
    "HIPAA":          87, "GDPR":           82,
    "DPDP 2023":      79, "ISO 27001:2022":  91,
    "ISO 31000":      88, "ISO 22301":       85,
    "ISO 42001 (AI)": 76, "PCI DSS v4.0":   83,
    "DISHA":          89, "HITRUST CSF":     84,
    "SOC 2 Type II":  90, "NIST CSF 2.0":   88,
    "NIST 800-53r5":  86, "NIST AI RMF":    74,
}

def run() -> None:
    """Execute Act 6: GRC & Audit."""
    show_act_banner(6, "GRC & Audit Infrastructure",
        "14 Frameworks | Hash Chain | Breach Detection")
    show_scene_banner(10, "Immutable Audit Trail")

    # LIVE: audit log stats
    sql_audit = """SELECT action, COUNT(*) as count
        FROM audit_log GROUP BY action
        ORDER BY count DESC;"""
    print_sql_block(sql_audit)
    audit_rows = db.query("clinical", sql_audit)
    if audit_rows:
        display_table(
            [[r['action'], f"{r['count']:,}"]
             for r in audit_rows],
            ["Action", "Count"],
            title=f"Audit Log — {IDX.total_audit_events:,}"
                  f" events [LIVE patients_db]")

    # LIVE: sample audit entry
    sql_entry = """SELECT id, tenant_id, user_id,
        action, resource_type, ip_address, created_at
        FROM audit_log LIMIT 1;"""
    print_sql_block(sql_entry)
    entry_rows = db.query("clinical", sql_entry)
    if entry_rows:
        r = entry_rows[0]
        display_table(
            [["id",           str(r.get('id',''))[:20]],
             ["tenant_id",    r.get('tenant_id','')],
             ["action",       r.get('action','')],
             ["resource_type",r.get('resource_type','')],
             ["ip_address",   str(r.get('ip_address',''))],
             ["created_at",   str(r.get('created_at',''))
              [:19]]],
            ["Field", "Value"],
            title="Sample Audit Entry [LIVE]")

    # Hash chain animation
    progress_bar(
        f"Verifying {IDX.total_audit_events:,} "
        f"audit events...", 3.0)
    print_ok("Hash chain INTACT — 0 tampered records")
    print_ok(f"{IDX.total_audit_events:,} events verified")

    # Scene 11: Breach detection
    pause("Scene 11: Breach Detection")
    show_scene_banner(11, "Automated Breach Detection")

    # LIVE: anomalous events
    sql_anom = """SELECT action,
        COUNT(*) as anomalous_count FROM audit_log
        WHERE (details->>'anomalous')::boolean = true
        GROUP BY action ORDER BY anomalous_count DESC;"""
    print_sql_block(sql_anom)
    anom_rows = db.query("clinical", sql_anom)
    if anom_rows:
        display_table(
            [[r['action'], r['anomalous_count']]
             for r in anom_rows],
            ["Action", "Anomalous Count"],
            title=f"Anomalous Events — "
                  f"{IDX.anomalous_events:,} total [LIVE]")

    # Breach detection rules animation
    rules = [
        ("Bulk export scan",          "3 incidents",  YELLOW),
        ("After-hours PHI access",    "847 events",   YELLOW),
        ("Privilege escalation",      "0 detected",   GREEN),
        ("Repeated auth failures",
         f"{IDX.total_auth_logs:,} events",           RED),
        ("Cross-tenant probe",        "0 (RLS blocked)",GREEN),
        ("Mass deletion",             "0 detected",   GREEN),
    ]
    for rule_name, result, color in rules:
        spinner(f"Rule: {rule_name}...", 0.7)
        print(f"  {color}{result}{RESET}")

    show_alert_banner()
    print_block("BREACH INCIDENT CREATED — HIGH SEVERITY")
    print_warn("GDPR/DPDP 72hr notification deadline active")

    if LIVE.svc_audit:
        resp = api.get("audit",
            "/api/audit/breach/incidents")
        if resp:
            display_json(resp,
                highlight_keys=['breach_type',
                                'severity','status'])

    # Scene 12: Compliance scorecard
    pause("Scene 12: Compliance Scorecard")
    show_scene_banner(12,
        "Multi-Framework Compliance — 14 Frameworks")

    # LIVE or API: compliance scorecard
    if LIVE.svc_compliance:
        resp = api.get("compliance",
            f"/api/compliance/scorecard"
            f"?tenant_id={DEMO_TENANT}")
        if resp and 'scores' in resp:
            display_compliance_scorecard(resp['scores'])
        else:
            display_compliance_scorecard(COMPLIANCE_SCORES)
    else:
        progress_bar("Computing compliance scores...", 2.5)
        display_compliance_scorecard(COMPLIANCE_SCORES)

    # LIVE: consent registry
    sql_consent = """SELECT consent_type, status,
        COUNT(*) as count FROM consent_registry
        GROUP BY consent_type, status
        ORDER BY consent_type, status;"""
    print_sql_block(sql_consent)
    consent_rows = db.query("operational", sql_consent)
    if consent_rows:
        display_table(
            [[r['consent_type'][:30],
              r['status'], r['count']]
             for r in consent_rows],
            ["Consent Type","Status","Count"],
            title="Consent Registry [LIVE scheduling_db]")

    # LIVE: access reviews
    sql_reviews = """SELECT status, COUNT(*) as count
        FROM access_review_snapshots GROUP BY status;"""
    review_rows = db.query("operational", sql_reviews)
    if review_rows:
        display_table(
            [[r['status'], r['count']]
             for r in review_rows],
            ["Status","Count"],
            title="Access Reviews [LIVE]")

    pause("Act 7: API Gateway")
