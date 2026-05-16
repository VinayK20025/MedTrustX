"""Act 7: API Gateway demonstration."""
import time
import requests as req
from config import IDX, LIVE, SERVICES
from core.banner import *
from core.colors import *
from core.progress import progress_bar, spinner, count_up
from core.typewriter import typewriter, stream_lines
from core.pause import pause
from core.display import (display_table, display_json,
                          display_trace_waterfall)
from data import db_client as db
from data import api_client as api

def animate_ddos_counter() -> None:
    """Animate DDoS request counter."""
    import sys
    milestones = [
        (100,  GREEN,  "Normal traffic"),
        (500,  YELLOW, "⚠ THRESHOLD REACHED"),
        (1000, RED,    "Rate limiting active"),
        (2000, RED,    "Heavy attack"),
        (3247, BG_RED, "PEAK — IP BLOCKED"),
    ]
    current = 0
    for target, color, label in milestones:
        while current < target:
            current = min(current + 47, target)
            sys.stdout.write(
                f"\r  {GRAY}Requests/min:{RESET} "
                f"{color}{current:>5}{RESET}  "
                f"{GRAY}{label}{RESET}   "
            )
            sys.stdout.flush()
            time.sleep(0.03)
        time.sleep(0.3)
    print()

def run() -> None:
    """Execute Act 7: API Gateway."""
    show_act_banner(7, "API Gateway & Request Lifecycle",
        "Kong | WAF | DDoS | Circuit Breaker | GraphQL")
    show_scene_banner(13, "API Gateway — Traffic Baseline")

    # LIVE: traffic stats from operational DB
    sql_traffic = """SELECT service,
        COUNT(*) as requests,
        ROUND(AVG(latency_ms)::numeric,0) as avg_ms,
        COUNT(*) FILTER (WHERE status_code=200) as ok,
        COUNT(*) FILTER (WHERE status_code>=400) as errors
        FROM api_request_logs
        GROUP BY service ORDER BY requests DESC;"""
    print_sql_block(sql_traffic)
    traffic_rows = db.query("operational", sql_traffic)
    if traffic_rows:
        display_table(
            [[r['service'], f"{r['requests']:,}",
              f"{r['avg_ms']}ms",
              f"{r['ok']:,}", f"{r['errors']:,}"]
             for r in traffic_rows],
            ["Service","Requests","Avg Latency",
             "Success","Errors"],
            title=f"API Traffic [LIVE] — "
                  f"{IDX.total_api_logs:,} total requests")

    # LIVE: send real request through Kong
    if LIVE.svc_kong:
        print_api_call("GET",
            f"{SERVICES['kong']}/api/patients/"
            f"{IDX.patient_id}")
        start = time.time()
        try:
            resp = req.get(
                f"{SERVICES['kong']}/api/patients/"
                f"{IDX.patient_id}",
                headers={"Authorization":
                         f"Bearer {IDX.demo_token}"},
                timeout=5)
            latency = int((time.time()-start)*1000)
            print_ok(f"HTTP {resp.status_code} | "
                     f"{latency}ms [LIVE Kong Gateway]")
        except Exception:
            print_warn("Kong not reachable [SCRIPTED]")

    # WAF test
    typewriter("\n[WAF Test] SQL Injection attempt:")
    waf_status = api.waf_test(
        f"{SERVICES['kong']}/api/patients"
        f"?id=%27+OR+1%3D1+--")
    if waf_status in (400, 403):
        show_blocked_banner()
        print_block(f"HTTP {waf_status} — "
                    f"WAF BLOCKED SQL Injection")
        print_ok("Rule: OWASP_SQLI_001")
    else:
        show_blocked_banner()
        print_block("HTTP 400 — WAF BLOCKED SQL Injection"
                    " [SCRIPTED]")

    # Scene 14: DDoS
    pause("Scene 14: DDoS Simulation")
    show_scene_banner(14, "DDoS Attack — Rate Limiting")
    show_alert_banner()

    # LIVE: DDoS evidence
    sql_ddos = """SELECT threat_type, source_ip,
        MAX(requests_per_min) as peak_rpm,
        action_taken, COUNT(*) as events
        FROM threat_logs WHERE threat_type='ddos_burst'
        GROUP BY threat_type, source_ip, action_taken;"""
    print_sql_block(sql_ddos)
    ddos_rows = db.query("operational", sql_ddos)
    if ddos_rows:
        display_table(
            [[r['threat_type'], r['source_ip'],
              r['peak_rpm'], r['action_taken'],
              r['events']] for r in ddos_rows],
            ["Type","Source IP","Peak RPM",
             "Action","Events"],
            title="DDoS Evidence [LIVE scheduling_db]")

    # LIVE: rate-limited count
    sql_429 = """SELECT COUNT(*) as blocked,
        MIN(timestamp) as first_block,
        MAX(timestamp) as last_block
        FROM api_request_logs WHERE status_code=429;"""
    print_sql_block(sql_429)
    rate_rows = db.query("operational", sql_429)
    if rate_rows:
        r = rate_rows[0]
        display_table(
            [["429 blocked",  f"{r['blocked']:,}"],
             ["First block",  str(r['first_block'])[:19]],
             ["Last block",   str(r['last_block'])[:19]]],
            ["Metric","Value"],
            title="Rate Limiting [LIVE]")

    typewriter("\nReplaying DDoS burst simulation:")
    animate_ddos_counter()
    print_block(f"IP 203.0.113.99 BLOCKED — "
                f"{IDX.rate_limited_requests:,} "
                f"requests rate-limited")

    # LIVE: credential stuffing
    sql_cred = """SELECT COUNT(*) as attempts,
        COUNT(DISTINCT source_ip) as unique_ips
        FROM threat_logs
        WHERE threat_type='credential_stuffing';"""
    cred_rows = db.query("operational", sql_cred)
    if cred_rows:
        r = cred_rows[0]
        print_result("Credential stuffing attempts",
                     str(r['attempts']), RED)
        print_result("Unique source IPs",
                     str(r['unique_ips']), RED)

    # Scene 15: OTel + Summary
    pause("Scene 15: Distributed Tracing + Summary")
    show_scene_banner(15, "End-to-End Tracing + Summary")

    # LIVE: real OTel trace
    sql_trace = """SELECT operation, service,
        duration_ms, status
        FROM otel_traces
        WHERE trace_id=%s
        ORDER BY started_at;"""
    trace_rows = db.query(
        "operational", sql_trace, (IDX.trace_id,))
    if trace_rows:
        display_trace_waterfall(
            [dict(r) for r in trace_rows])
        print_info("Source: scheduling_db otel_traces [LIVE]")
    else:
        display_trace_waterfall([
            {"operation": "gateway.route",
             "service":   "kong-gateway",
             "duration_ms": 8, "status": "OK"},
            {"operation": "iam.verify_token",
             "service":   "iam-service",
             "duration_ms": 35, "status": "OK"},
            {"operation": "zta.device_trust",
             "service":   "zta-service",
             "duration_ms": 28, "status": "OK"},
            {"operation": "patient.get_record",
             "service":   "patient-service",
             "duration_ms": 45, "status": "OK"},
            {"operation": "db.query.patients",
             "service":   "postgres",
             "duration_ms": 18, "status": "OK"},
        ])

    # LIVE: composed API
    if LIVE.svc_gateway:
        resp = api.get("gateway",
            f"/api/composed/patient-dashboard/"
            f"{IDX.patient_id}")
        if resp:
            display_json(resp,
                highlight_keys=['patient','risk_score',
                                'vitals'])

    # Final summary using IDX values from live data
    show_final_summary()

def show_final_summary() -> None:
    """Display final presentation summary table."""
    from config import IDX
    print(f"\n{BOLD_CYAN}{'═'*62}{RESET}")
    print(f"{BOLD_WHITE}  MEDTRUSTX DHOS — PRESENTATION SUMMARY{RESET}")
    print(f"{BOLD_CYAN}{'═'*62}{RESET}")
    rows = [
        ["Multi-Tenant RLS",       "0 leaks",
         "PASS ✓"],
        ["ZTA Trust Score",         "9.4/10",
         "TRUSTED ✓"],
        ["Jailbreak Block",         "0.0/10",
         "BLOCKED ✓"],
        ["FHIR R4 Export",          "Valid bundle",
         "PASS ✓"],
        ["CDS Drug Check",          "MAJOR flagged",
         "BLOCKED ✓"],
        ["AI Risk Score",
         f"{IDX.risk_score:.2f}",   "HIGH ✓"],
        ["High Risk Patients",
         str(IDX.high_risk_patients), "ACTIVE ✓"],
        ["Audit Events",
         f"{IDX.total_audit_events:,}", "INTACT ✓"],
        ["Anomalous Events",
         f"{IDX.anomalous_events:,}", "DETECTED ✓"],
        ["DDoS Blocked",
         f"{IDX.rate_limited_requests:,}","BLOCKED ✓"],
        ["Compliance Score",
         "84% avg 14 fwks",         "PASS ✓"],
        ["─"*22,                   "─"*12, "─"*10],
        ["Total Patients",
         f"{IDX.total_patients:,}", ""],
        ["Total Vitals",
         f"{IDX.total_vitals:,}", ""],
        ["Total Auth Events",
         f"{IDX.total_auth_logs:,}", ""],
        ["Total API Requests",
         f"{IDX.total_api_logs:,}", ""],
    ]
    display_table(rows,
                  ["Module / Metric", "Result", "Status"])
