"""Pre-fetch all live data at startup into IDX dataclass."""
import config
from config import IDX, LIVE, FALLBACK_TOKEN
from data import db_client as db
from data import api_client as api
from data import redis_client as redis
from core.colors import print_ok, print_warn, print_info
from core.progress import progress_bar

def detect_live_services() -> None:
    """Health-check all DBs and services."""
    print_info("Detecting live services...")

    # Test databases
    for db_key in ['clinical','operational','iam','analytics']:
        alive = db.test_connection(db_key)
        flag = f"db_{db_key}"
        setattr(LIVE, flag, alive)
        if alive:
            print_ok(f"{db_key}_db → LIVE")
        else:
            print_warn(f"{db_key}_db → SCRIPTED")

    # Test microservices
    for svc in ['patient','clinical','ai','audit',
                'compliance','consent','zta','iam',
                'rls','gateway','kong']:
        alive = api.health_check(svc)
        flag = f"svc_{svc}"
        setattr(LIVE, flag, alive)
        if alive:
            print_ok(f"{svc}-service → LIVE")

    # Test Redis
    if redis.ping():
        print_ok("Redis → LIVE")
    else:
        print_warn("Redis → UNAVAILABLE")

def prefetch_data_index() -> None:
    """Fetch all IDX values from live backends."""
    progress_bar("Pre-fetching live backend data...", 4.0)

    # ── Patient data from clinical DB ─────────────────────
    IDX.total_patients = db.query_scalar(
        "clinical",
        "SELECT COUNT(*) FROM patients",
        fallback=1005)

    row = db.query_with_rls(
        "clinical", "tenant_general",
        """SELECT id::text, mrn, first_name, last_name,
           date_of_birth::text
           FROM patients
           WHERE tenant_id='tenant_general'
           LIMIT 1""")
    if row:
        IDX.patient_id   = row[0].get('id',
                           config.FALLBACK_PATIENT_ID)
        IDX.patient_mrn  = row[0].get('mrn',
                           config.FALLBACK_PATIENT_MRN)
        IDX.patient_name = (
            f"{row[0].get('first_name','')} "
            f"{row[0].get('last_name','')}"
        ).strip() or config.FALLBACK_PATIENT_NAME
        IDX.patient_dob  = row[0].get('date_of_birth','N/A')

    IDX.tenant_apollo_count = db.query_scalar(
        "clinical",
        "SELECT COUNT(*) FROM patients "
        "WHERE tenant_id='tenant_apollo'",
        fallback=5)

    IDX.tenant_general_count = db.query_scalar(
        "clinical",
        "SELECT COUNT(*) FROM patients "
        "WHERE tenant_id='tenant_general'",
        fallback=700)

    IDX.tenant_outpatient_count = db.query_scalar(
        "clinical",
        "SELECT COUNT(*) FROM patients "
        "WHERE tenant_id='tenant_outpatient'",
        fallback=300)

    IDX.total_audit_events = db.query_scalar(
        "clinical",
        "SELECT COUNT(*) FROM audit_log",
        fallback=52063)

    IDX.anomalous_events = db.query_scalar(
        "clinical",
        "SELECT COUNT(*) FROM audit_log "
        "WHERE (details->>'anomalous')::boolean = true",
        fallback=1504)

    # ── Analytics data ────────────────────────────────────
    IDX.total_vitals = db.query_scalar(
        "analytics",
        "SELECT COUNT(*) FROM patient_vitals",
        fallback=221991)

    IDX.total_risks = db.query_scalar(
        "analytics",
        "SELECT COUNT(*) FROM readmission_risk",
        fallback=3386)

    IDX.high_risk_patients = db.query_scalar(
        "analytics",
        "SELECT COUNT(*) FROM readmission_risk "
        "WHERE risk_label='high'",
        fallback=4)

    risk_row = db.query(
        "analytics",
        "SELECT risk_score, patient_id::text "
        "FROM readmission_risk "
        "ORDER BY risk_score DESC LIMIT 1")
    if risk_row:
        IDX.risk_score  = float(
            risk_row[0].get('risk_score', 0.73))
        IDX.patient_id  = IDX.patient_id or str(
            risk_row[0].get('patient_id',
                            config.FALLBACK_PATIENT_ID))

    # ── IAM data ──────────────────────────────────────────
    IDX.total_auth_logs = db.query_scalar(
        "iam",
        "SELECT COUNT(*) FROM auth_logs",
        fallback=14685)

    IDX.compliant_devices = db.query_scalar(
        "iam",
        "SELECT COUNT(*) FROM devices "
        "WHERE compliance_status='compliant'",
        fallback=246)

    IDX.jailbroken_devices = db.query_scalar(
        "iam",
        "SELECT COUNT(*) FROM devices "
        "WHERE compliance_status='jailbroken'",
        fallback=48)

    dev_row = db.query(
        "iam",
        "SELECT id::text FROM devices "
        "WHERE compliance_status='compliant' LIMIT 1")
    if dev_row:
        IDX.device_id_compliant = str(
            dev_row[0].get('id',
                           config.FALLBACK_DEVICE_ID))

    jail_row = db.query(
        "iam",
        "SELECT id::text FROM devices "
        "WHERE compliance_status='jailbroken' LIMIT 1")
    if jail_row:
        IDX.device_id_jailbroken = str(
            jail_row[0].get('id',
                            config.FALLBACK_DEVICE_ID))

    user_row = db.query(
        "iam",
        "SELECT id::text FROM users LIMIT 1")
    if user_row:
        IDX.user_id = str(
            user_row[0].get('id', config.FALLBACK_USER_ID))

    # ── Operational data ──────────────────────────────────
    IDX.total_api_logs = db.query_scalar(
        "operational",
        "SELECT COUNT(*) FROM api_request_logs",
        fallback=58074)

    IDX.total_threats = db.query_scalar(
        "operational",
        "SELECT COUNT(*) FROM threat_logs",
        fallback=285)

    IDX.rate_limited_requests = db.query_scalar(
        "operational",
        "SELECT COUNT(*) FROM api_request_logs "
        "WHERE status_code=429",
        fallback=8280)

    IDX.total_consents = db.query_scalar(
        "operational",
        "SELECT COUNT(*) FROM consent_registry",
        fallback=2500)

    trace_row = db.query(
        "operational",
        "SELECT trace_id FROM otel_traces LIMIT 1")
    if trace_row:
        IDX.trace_id = str(
            trace_row[0].get('trace_id',
                             config.FALLBACK_TRACE_ID))

    # ── Get demo auth token ────────────────────────────────
    if LIVE.svc_iam:
        token_resp = api.post("iam", "/api/iam/sessions",
            {"username": "demo_admin",
             "password": "Demo@MedTrustX2026"},
            show_call=False)
        if token_resp and 'token' in token_resp:
            IDX.demo_token = token_resp['token']
            api.set_token(IDX.demo_token)
        else:
            api.set_token(FALLBACK_TOKEN)
    else:
        api.set_token(FALLBACK_TOKEN)

    print_ok(
        f"Data index loaded: "
        f"{IDX.total_patients:,} patients | "
        f"{IDX.total_audit_events:,} audit events | "
        f"{IDX.total_vitals:,} vitals"
    )
