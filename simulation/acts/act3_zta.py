"""Act 3: ZTA device trust scoring demonstration."""
import time
from config import IDX, LIVE
from core.banner import *
from core.colors import *
from core.progress import (progress_bar, spinner,
                           draw_trust_meter)
from core.typewriter import typewriter, stream_lines
from core.pause import pause
from core.display import display_table
from data import db_client as db
from data import api_client as api

CHECKS = [
    (1,  "OS Patch Level",       0.15),
    (2,  "Antivirus/EDR",        0.15),
    (3,  "Disk Encryption",      0.10),
    (4,  "Firewall",             0.08),
    (5,  "Screen Lock",          0.10),
    (6,  "Jailbreak Detection",  0.12),
    (7,  "Certificate/Identity", 0.10),
    (8,  "Network Security",     0.08),
    (9,  "Process Integrity",    0.07),
    (10, "Behavioral Anomaly",   0.05),
]

COMPLIANT_SCORES = [10,9,10,7,10,10,10,8,10,9]
JAILBROKEN_SCORES = [8,5,10,4,3,1,0,0,0,0]

def animate_checks(scores: list[int],
                   device_type: str) -> float:
    """Animate 10 checks and return composite score."""
    total = 0.0
    for i, (num, name, weight) in enumerate(CHECKS):
        spinner(f"Check {num:02d}/10: {name}...", 0.7)
        score = scores[i] if i < len(scores) else 5
        weighted = score * weight
        total += weighted
        if device_type == "jailbroken" and num == 6:
            print(f"\n{BG_RED}  "
                  f"⚡ CHECK 6 OVERRIDE: "
                  f"Jailbreak = 1/10 → IMMEDIATE BLOCK"
                  f"  {RESET}")
            show_blocked_banner()
            return 0.0
        color = GREEN if score >= 7 \
            else YELLOW if score >= 4 else RED
        print(f"  {GRAY}Check {num:02d} Score:{RESET} "
              f"{color}{score}/10{RESET}  "
              f"{GRAY}weight={weight}{RESET}  "
              f"{CYAN}weighted={weighted:.3f}{RESET}")
    return round(total, 2)

def run() -> None:
    """Execute Act 3: ZTA & Device Trust."""
    show_act_banner(3,
        "Zero Trust Architecture & IAM",
        "Device Trust Agent | OPA | 10-Point Score")
    show_scene_banner(4, "Device Trust — 10 System Checks")

    # LIVE: device inventory from iam_db
    print_sql_block("""SELECT compliance_status, COUNT(*)
    FROM devices GROUP BY compliance_status;""")
    rows = db.query(
        "iam",
        "SELECT compliance_status, COUNT(*) as count "
        "FROM devices GROUP BY compliance_status "
        "ORDER BY count DESC")
    if rows:
        display_table(
            [[r['compliance_status'], r['count']]
             for r in rows],
            ["Compliance Status", "Count"],
            title="Device Inventory [LIVE iam_db]")
    else:
        display_table(
            [['compliant',    IDX.compliant_devices],
             ['jailbroken',   IDX.jailbroken_devices],
             ['missing_av',   106],
             ['unregistered', 48]],
            ["Compliance Status", "Count"],
            title="Device Inventory [SCRIPTED]")

    # LIVE or scripted: ZTA API trust evaluation
    typewriter(f"\nEvaluating compliant device: "
               f"{IDX.device_id_compliant[:20]}...")
    if LIVE.svc_zta:
        resp = api.get("zta",
            f"/api/zta/device/"
            f"{IDX.device_id_compliant}/trust")
        if resp:
            score = float(resp.get('trust_score', 9.4))
            level = resp.get('trust_level', 'TRUSTED')
            draw_trust_meter(score)
            print_ok(f"Trust Level: {level}")
        else:
            score = animate_checks(COMPLIANT_SCORES,
                                   "compliant")
            draw_trust_meter(score)
    else:
        score = animate_checks(COMPLIANT_SCORES, "compliant")
        draw_trust_meter(score)

    # LIVE: auth log confirmation
    print_sql_block(
        f"SELECT action, mfa_passed, opa_decision "
        f"FROM auth_logs LIMIT 3;")
    auth_rows = db.query(
        "iam",
        "SELECT action, mfa_passed, opa_decision, "
        "logged_at FROM auth_logs "
        "ORDER BY logged_at DESC LIMIT 3")
    if auth_rows:
        display_table(
            [[r['action'], r['mfa_passed'],
              r['opa_decision']] for r in auth_rows],
            ["Action", "MFA Passed", "OPA Decision"],
            title="Auth Log [LIVE iam_db]")

    # Scene 5: Jailbroken device
    pause("Scene 5: Jailbroken Device Block")
    show_scene_banner(5,
        "ZTA Enforcement — Jailbroken Device")
    show_alert_banner()

    # LIVE: fetch jailbroken device
    print_sql_block(
        "SELECT id, device_name, compliance_status "
        "FROM devices WHERE compliance_status='jailbroken' "
        "LIMIT 1;")
    jail_rows = db.query(
        "iam",
        "SELECT id::text, device_name, "
        "compliance_status FROM devices "
        "WHERE compliance_status='jailbroken' LIMIT 1")
    if jail_rows:
        display_table(
            [[r['id'][:20]+'...',
              r['device_name'],
              r['compliance_status']]
             for r in jail_rows],
            ["Device ID", "Name", "Status"],
            title="Jailbroken Device [LIVE iam_db]")

    # Animate jailbreak detection
    animate_checks(JAILBROKEN_SCORES, "jailbroken")
    print_block("Trust Score: 0.0/10 — BLOCKED")

    # LIVE: deny count from auth_logs
    deny_count = db.query_scalar(
        "iam",
        "SELECT COUNT(*) FROM auth_logs "
        "WHERE opa_decision='deny'",
        fallback=1848)
    print_result("Total deny decisions in iam_db",
                 f"{deny_count:,}", RED)

    pause("Act 4: Clinical Core & FHIR R4")
