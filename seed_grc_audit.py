import uuid, random, json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text

CLINICAL_URL     = "postgresql://medtrust_clinical_admin:clinical_db_secret_2026@localhost:5432/patients_db"
OPERATIONAL_URL  = "postgresql://medtrust_ops_admin:operational_db_secret_2026@localhost:5433/scheduling_db"

clinical_engine    = create_engine(CLINICAL_URL)
operational_engine = create_engine(OPERATIONAL_URL)

# ── Config ────────────────────────────────────────────────────
TENANTS    = ["tenant_apollo", "tenant_general", "tenant_outpatient"]
ACTIONS    = ["VIEW", "UPDATE", "DELETE", "EXPORT", "CREATE", "DOWNLOAD"]
RESOURCES  = ["patient_record", "lab_result", "prescription",
               "appointment", "imaging_report", "consent_form"]
DEPARTMENTS = ["Cardiology","Emergency","Oncology","Radiology",
               "Pharmacy","ICU","Pediatrics","Orthopedics"]

now = datetime.utcnow()

# ── Load real user + patient IDs from existing tables ─────────
print("=== Loading existing user & patient IDs ===")
with clinical_engine.connect() as conn:
    conn.execute(text("SET app.tenant_id = 'tenant_general'"))
    patient_rows = conn.execute(text(
        "SELECT id, tenant_id FROM patients LIMIT 500"
    )).fetchall()

with create_engine(
    "postgresql://medtrust_iam_admin:iam_db_secret_2026@localhost:5434/iam_db"
).connect() as conn:
    user_rows = conn.execute(text(
        "SELECT id, tenant_id FROM users LIMIT 300"
    )).fetchall()

patients = [(str(r[0]), str(r[1])) for r in patient_rows]
users    = [(str(r[0]), str(r[1])) for r in user_rows]
print(f"  Loaded {len(patients)} patients, {len(users)} users")

# ── STEP 1: Create consent_registry & access_review tables ────
print("\n=== Creating GRC tables in scheduling_db ===")
with operational_engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS consent_registry (
            id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id     VARCHAR(64) NOT NULL,
            patient_id    UUID NOT NULL,
            consent_type  VARCHAR(64) NOT NULL,
            status        VARCHAR(16) NOT NULL,
            granted_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at    TIMESTAMP WITH TIME ZONE,
            notes         TEXT
        );

        CREATE TABLE IF NOT EXISTS access_review_snapshots (
            id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            tenant_id     VARCHAR(64) NOT NULL,
            user_id       UUID NOT NULL,
            role_name     VARCHAR(64),
            permissions   JSONB,
            review_date   DATE NOT NULL,
            reviewed_by   UUID,
            status        VARCHAR(32) DEFAULT 'pending'
        );
    """))
    conn.commit()
print("  Tables created: consent_registry, access_review_snapshots")

# ── STEP 2: Seed audit_log (500,000+ events) ──────────────────
print("\n=== Seeding audit_log (500k+ events) ===")

action_weights = [
    ("VIEW",     60), ("UPDATE", 15), ("CREATE", 10),
    ("EXPORT",    5), ("DELETE",  5), ("DOWNLOAD", 5)
]
action_pool = [a for a, w in action_weights for _ in range(w)]

BATCH_SIZE  = 1000
total_inserted = 0

with clinical_engine.connect() as conn:
    conn.execute(text("SET app.tenant_id = 'tenant_general'"))

    for day in range(60):
        day_start   = now - timedelta(days=60 - day)
        daily_count = random.randint(700, 1000)
        batch       = []

        for _ in range(daily_count):
            user_id, user_tenant = random.choice(users)
            pat_id,  pat_tenant  = random.choice(patients)
            action    = random.choice(action_pool)
            resource  = random.choice(RESOURCES)
            ts        = day_start + timedelta(seconds=random.randint(0, 86400))
            ip        = f"10.{random.randint(0,3)}.{random.randint(1,254)}.{random.randint(1,254)}"

            # Inject anomalous events (~3% of logs)
            is_anomalous = random.random() < 0.03
            if is_anomalous:
                action = random.choice(["EXPORT", "DELETE", "DOWNLOAD"])
                ts     = day_start + timedelta(
                    hours=random.choice([0,1,2,3,22,23]),
                    minutes=random.randint(0,59)
                )

            details = {
                "department":   random.choice(DEPARTMENTS),
                "anomalous":    is_anomalous,
                "resource_name": f"{resource}_{str(pat_id)[:8]}",
                "user_agent":   "MedTrustX-Frontend/2.1"
            }

            batch.append({
                "id":            str(uuid.uuid4()),
                "tenant_id":     user_tenant,
                "user_id":       user_id,
                "action":        action,
                "resource_type": resource,
                "resource_id":   pat_id,
                "details":       json.dumps(details),
                "ip_address":    ip,
                "created_at":    ts.isoformat()
            })

        # Bulk insert batch
        for record in batch:
            conn.execute(text("""
                INSERT INTO audit_log (
                    id, tenant_id, user_id, action,
                    resource_type, resource_id, details,
                    ip_address, created_at
                ) VALUES (
                    :id, :tenant_id, :user_id, :action,
                    :resource_type, CAST(:resource_id AS uuid),
                    CAST(:details AS jsonb), CAST(:ip_address AS inet),
                    :created_at
                )
            """), record)

        conn.commit()
        total_inserted += len(batch)
        if day % 10 == 0:
            print(f"  Day {day+1}/60 — {total_inserted} events so far...")

print(f"  Total audit events inserted: {total_inserted}")

# ── STEP 3: Seed consent_registry ─────────────────────────────
print("\n=== Seeding consent registry ===")
CONSENT_TYPES = [
    "clinical_research",
    "third_party_sharing",
    "ai_model_training",
    "anonymized_data_export",
    "marketing_communications"
]

consent_rows = []
for pat_id, pat_tenant in patients:
    for consent_type in CONSENT_TYPES:
        status     = random.choices(
            ["opt_in", "opt_out", "pending"],
            weights=[60, 30, 10]
        )[0]
        granted_at = now - timedelta(days=random.randint(30, 730))
        expires_at = granted_at + timedelta(days=365)
        consent_rows.append({
            "id":           str(uuid.uuid4()),
            "tenant_id":    pat_tenant,
            "patient_id":   pat_id,
            "consent_type": consent_type,
            "status":       status,
            "granted_at":   granted_at.isoformat(),
            "expires_at":   expires_at.isoformat(),
            "notes":        f"Auto-generated consent record for {consent_type}"
        })

with operational_engine.connect() as conn:
    for r in consent_rows:
        conn.execute(text("""
            INSERT INTO consent_registry (
                id, tenant_id, patient_id, consent_type,
                status, granted_at, expires_at, notes
            ) VALUES (
                :id, :tenant_id, :patient_id, :consent_type,
                :status, :granted_at, :expires_at, :notes
            )
        """), r)
    conn.commit()
print(f"  Inserted {len(consent_rows)} consent records")

# ── STEP 4: Seed access_review_snapshots ──────────────────────
print("\n=== Seeding access review snapshots ===")
ROLE_PERMISSIONS = {
    "Doctor":       ["read:patient", "write:clinical", "read:lab"],
    "Nurse":        ["read:patient", "write:vitals"],
    "IT_Admin":     ["read:all", "write:system", "admin:infra"],
    "Pharmacist":   ["read:prescription", "write:medication"],
    "Board_Member": ["read:reports", "read:analytics"],
    "Radiologist":  ["read:imaging", "write:imaging"],
    "Lab_Tech":     ["read:lab", "write:lab"],
    "Receptionist": ["read:demographics", "write:appointments"]
}

review_rows = []
reviewer_id = str(users[0][0]) if users else str(uuid.uuid4())
for review_month in range(6):
    review_date = (now - timedelta(days=30 * review_month)).date()
    for user_id, tenant_id in random.sample(users, min(50, len(users))):
        role = random.choice(list(ROLE_PERMISSIONS.keys()))
        review_rows.append({
            "id":          str(uuid.uuid4()),
            "tenant_id":   tenant_id,
            "user_id":     user_id,
            "role_name":   role,
            "permissions": json.dumps(ROLE_PERMISSIONS[role]),
            "review_date": str(review_date),
            "reviewed_by": reviewer_id,
            "status":      random.choice(["approved", "approved", "flagged", "pending"])
        })

with operational_engine.connect() as conn:
    for r in review_rows:
        conn.execute(text("""
            INSERT INTO access_review_snapshots (
                id, tenant_id, user_id, role_name,
                permissions, review_date, reviewed_by, status
            ) VALUES (
                :id, :tenant_id, :user_id, :role_name,
                CAST(:permissions AS jsonb), :review_date,
                :reviewed_by, :status
            )
        """), r)
    conn.commit()
print(f"  Inserted {len(review_rows)} access review snapshots")

# ── STEP 5: Verify ────────────────────────────────────────────
print("\n=== Verification ===")
with clinical_engine.connect() as conn:
    conn.execute(text("SET app.tenant_id = 'tenant_general'"))
    total_audit = conn.execute(text("SELECT COUNT(*) FROM audit_log")).scalar()
    anomalous   = conn.execute(text(
        "SELECT COUNT(*) FROM audit_log WHERE (details->>'anomalous')::boolean = true"
    )).scalar()
    by_action   = conn.execute(text(
        "SELECT action, COUNT(*) FROM audit_log GROUP BY action ORDER BY COUNT(*) DESC"
    )).fetchall()

with operational_engine.connect() as conn:
    total_consent = conn.execute(text("SELECT COUNT(*) FROM consent_registry")).scalar()
    opt_in        = conn.execute(text("SELECT COUNT(*) FROM consent_registry WHERE status='opt_in'")).scalar()
    opt_out       = conn.execute(text("SELECT COUNT(*) FROM consent_registry WHERE status='opt_out'")).scalar()
    total_reviews = conn.execute(text("SELECT COUNT(*) FROM access_review_snapshots")).scalar()
    flagged       = conn.execute(text("SELECT COUNT(*) FROM access_review_snapshots WHERE status='flagged'")).scalar()

print(f"  audit_log total      : {total_audit}")
print(f"  anomalous events     : {anomalous}")
print(f"  by action:")
for row in by_action:
    print(f"    {row[0]:<12} : {row[1]}")
print(f"  consent_registry     : {total_consent}")
print(f"    opt_in             : {opt_in}")
print(f"    opt_out            : {opt_out}")
print(f"  access_reviews       : {total_reviews}")
print(f"    flagged            : {flagged}")
print("\nGRC & Audit seeding complete!")
