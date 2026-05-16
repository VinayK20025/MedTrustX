from dataclasses import dataclass, field
from typing import Dict

# ── Database configs ──────────────────────────────────────
DB_CONFIGS: Dict[str, dict] = {
    "clinical": {
        "host": "localhost", "port": 5432,
        "dbname": "patients_db",
        "user": "medtrust_clinical_admin",
        "password": "clinical_db_secret_2026",
    },
    "operational": {
        "host": "localhost", "port": 5433,
        "dbname": "scheduling_db",
        "user": "medtrust_ops_admin",
        "password": "operational_db_secret_2026",
    },
    "iam": {
        "host": "localhost", "port": 5434,
        "dbname": "iam_db",
        "user": "medtrust_iam_admin",
        "password": "iam_db_secret_2026",
    },
    "analytics": {
        "host": "localhost", "port": 5435,
        "dbname": "analytics_db",
        "user": "medtrust_analytics_admin",
        "password": "analytics_db_secret_2026",
    },
}

# ── Service URLs ──────────────────────────────────────────
SERVICES: Dict[str, str] = {
    "patient":     "http://localhost:8018",
    "clinical":    "http://localhost:8019",
    "appointment": "http://localhost:8020",
    "ai":          "http://localhost:8010",
    "audit":       "http://localhost:8015",
    "compliance":  "http://localhost:8016",
    "consent":     "http://localhost:8017",
    "zta":         "http://localhost:8012",
    "iam":         "http://localhost:8013",
    "rls":         "http://localhost:8011",
    "gateway":     "http://localhost:8022",
    "kong":        "http://localhost:8000",
}

# ── Redis ─────────────────────────────────────────────────
REDIS_CONFIG = {
    "host": "localhost",
    "port": 6379,
    "password": "redis_secret_2026",
    "decode_responses": True,
}

# ── Tenants ───────────────────────────────────────────────
TENANTS = {
    "apollo":     "tenant_apollo",
    "general":    "tenant_general",
    "outpatient": "tenant_outpatient",
}
DEMO_TENANT = "tenant_general"

# ── Timing ────────────────────────────────────────────────
TYPEWRITER_DELAY: float = 0.03
STEP_DELAY:       float = 0.5
SCENE_DELAY:      float = 1.0
API_TIMEOUT:      int   = 5
DB_TIMEOUT:       int   = 8
SPEED_MULTIPLIER: float = 1.0   # set from CLI args

# ── Demo fallback values ──────────────────────────────────
FALLBACK_PATIENT_ID   = "aee7bbe1-0c45-c028-1e62-1f4cdb30c273"
FALLBACK_PATIENT_NAME = "Wilfredo Fritsch"
FALLBACK_PATIENT_MRN  = "aee7bbe1-0c45-c028"
FALLBACK_DEVICE_ID    = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
FALLBACK_USER_ID      = "88a79786-6ae0-4dc5-a789-89139af0d0a0"
FALLBACK_TRACE_ID     = "4bf92f3577b34da6a3ce929d0e0e4736"
FALLBACK_RISK_SCORE   = 0.73
FALLBACK_TOKEN        = "eyJhbGciOiJSUzI1NiJ9.demo.token"

# ── Live mode flags (set by data_index.py at startup) ─────
class LiveFlags:
    db_clinical:    bool = False
    db_operational: bool = False
    db_iam:         bool = False
    db_analytics:   bool = False
    svc_patient:    bool = False
    svc_clinical:   bool = False
    svc_ai:         bool = False
    svc_audit:      bool = False
    svc_zta:        bool = False
    svc_iam:        bool = False
    svc_gateway:    bool = False
    svc_kong:       bool = False

LIVE = LiveFlags()

# ── Global data index (populated by data_index.py) ────────
@dataclass
class DataIndex:
    # Patient data
    patient_id:             str   = FALLBACK_PATIENT_ID
    patient_name:           str   = FALLBACK_PATIENT_NAME
    patient_mrn:            str   = FALLBACK_PATIENT_MRN
    patient_dob:            str   = "2010-08-04"
    # Counts
    total_patients:         int   = 1005
    tenant_apollo_count:    int   = 5
    tenant_general_count:   int   = 700
    tenant_outpatient_count:int   = 300
    total_audit_events:     int   = 52063
    anomalous_events:       int   = 1504
    total_vitals:           int   = 221991
    total_risks:            int   = 3386
    high_risk_patients:     int   = 4
    total_auth_logs:        int   = 14685
    compliant_devices:      int   = 246
    jailbroken_devices:     int   = 48
    total_api_logs:         int   = 58074
    total_threats:          int   = 285
    rate_limited_requests:  int   = 8280
    total_consents:         int   = 2500
    # Device IDs
    device_id_compliant:    str   = FALLBACK_DEVICE_ID
    device_id_jailbroken:   str   = FALLBACK_DEVICE_ID
    user_id:                str   = FALLBACK_USER_ID
    trace_id:               str   = FALLBACK_TRACE_ID
    # Scores
    risk_score:             float = FALLBACK_RISK_SCORE
    compliance_score:       float = 84.0
    # Auth
    demo_token:             str   = FALLBACK_TOKEN

IDX = DataIndex()
