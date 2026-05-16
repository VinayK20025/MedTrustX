"""Act 1: System startup and health verification."""
import subprocess
import time
from config import IDX, LIVE, DB_CONFIGS, SERVICES
from core.banner import show_main_banner, show_scene_banner
from core.colors import *
from core.progress import progress_bar, count_up, spinner
from core.typewriter import typewriter, typewriter_info
from core.pause import pause
from core.display import display_table
from data import db_client as db
from data import api_client as api
from data import redis_client as redis

def run() -> None:
    """Execute Act 1: System Initialization."""
    show_main_banner()
    show_scene_banner(1, "MedTrustX DHOS — System Initialization")

    # Step 1: Database connectivity
    print_step(1, 5, "Verifying database connectivity...")
    db_rows = []
    for db_key, cfg in DB_CONFIGS.items():
        spinner(f"Connecting to {cfg['dbname']}...", 0.8)
        version = db.query_scalar(
            db_key,
            "SELECT version()",
            fallback="")
        if version:
            pg_ver = str(version).split()[1] \
                     if version else "N/A"
            status = f"[LIVE] PostgreSQL {pg_ver}"
            db_rows.append([cfg['dbname'],
                             cfg['port'], status])
            print_ok(f"{cfg['dbname']} → {status}")
        else:
            db_rows.append([cfg['dbname'],
                             cfg['port'], "[SCRIPTED]"])
            print_warn(f"{cfg['dbname']} → Unavailable")

    # Step 2: Redis check
    print_step(2, 5, "Verifying Redis connectivity...")
    if redis.ping():
        info = redis.get_info()
        ver = info.get('redis_version', 'N/A')
        print_ok(f"Redis {ver} | localhost:6379 | Connected")
    else:
        print_warn("Redis → Connection failed [SCRIPTED]")

    # Step 3: Docker containers
    print_step(3, 5, "Checking Docker containers...")
    try:
        result = subprocess.run(
            ['docker', 'ps', '--format',
             'table {{.Names}}\t{{.Status}}\t{{.Ports}}'],
            capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            for line in result.stdout.strip().split('\n'):
                if 'medtrust' in line.lower():
                    color = GREEN if 'Up' in line else RED
                    print(f"  {color}{line}{RESET}")
        else:
            print_warn("Docker not available")
    except Exception:
        print_warn("Docker check skipped")

    # Step 4: Dataset inventory using LIVE IDX values
    print_step(4, 5, "Live dataset inventory:")
    datasets = [
        ("patients          ", IDX.total_patients),
        ("audit_log events  ", IDX.total_audit_events),
        ("vital observations", IDX.total_vitals),
        ("auth_log events   ", IDX.total_auth_logs),
        ("api_request_logs  ", IDX.total_api_logs),
        ("threat_events     ", IDX.total_threats),
        ("consent_records   ", IDX.total_consents),
        ("readmission_risks ", IDX.total_risks),
    ]
    for label, target in datasets:
        count_up(label, target, duration=0.8)

    # Step 5: Module readiness table
    print_step(5, 5, "Module readiness:")
    modules = [
        ["Multi-Tenant RLS",        "LIVE" if LIVE.db_clinical else "SCRIPTED",  "✓"],
        ["ZTA & Device Trust",       "LIVE" if LIVE.svc_zta    else "SCRIPTED",  "✓"],
        ["Clinical Core + FHIR R4",  "LIVE" if LIVE.svc_patient else "SCRIPTED", "✓"],
        ["AI Inference Engine",      "LIVE" if LIVE.svc_ai     else "SCRIPTED",  "✓"],
        ["GRC & Audit",              "LIVE" if LIVE.svc_audit  else "SCRIPTED",  "✓"],
        ["API Gateway",              "LIVE" if LIVE.svc_kong   else "SCRIPTED",  "✓"],
    ]
    display_table(modules,
                  ["Module", "Mode", "Status"],
                  title="\nSystem Readiness")

    pause("Act 2: Multi-Tenant RLS")
