import uuid, random, hashlib, json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text

DB_URL = "postgresql://medtrust_iam_admin:iam_db_secret_2026@localhost:5434/iam_db"
engine = create_engine(DB_URL)

# ── Tenant UUIDs (fixed so foreign keys stay consistent) ──────
TENANT_GENERAL    = str(uuid.uuid5(uuid.NAMESPACE_DNS, "tenant_general"))
TENANT_OUTPATIENT = str(uuid.uuid5(uuid.NAMESPACE_DNS, "tenant_outpatient"))

# ── Hospital staff configuration ──────────────────────────────
ROLES = [
    ("Doctor",        "Attending physician with full clinical access",     3),
    ("Nurse",         "Clinical nurse with patient care access",           2),
    ("IT_Admin",      "System administrator with infrastructure access",   4),
    ("Pharmacist",    "Medication management and prescription access",     2),
    ("Board_Member",  "Executive oversight and reporting access",          5),
    ("Radiologist",   "Medical imaging and diagnostic access",             3),
    ("Lab_Tech",      "Laboratory results and specimen access",            2),
    ("Receptionist",  "Front desk scheduling and demographics access",     1),
]

DEPARTMENTS = [
    "Cardiology", "Emergency", "Oncology", "Radiology",
    "Pharmacy", "ICU", "Pediatrics", "Orthopedics",
    "Neurology", "Administration", "Laboratory", "General"
]

FIRST_NAMES = [
    "Priya","Arjun","Meera","Vikram","Anjali","Ravi","Deepa","Suresh",
    "Kavitha","Rajesh","Lakshmi","Arun","Sunita","Mohan","Divya","Kiran",
    "Anita","Sanjay","Pooja","Rahul","Smitha","Ganesh","Rekha","Vijay",
    "Nisha","Prakash","Usha","Ramesh","Geeta","Ashok","Sushma","Dinesh",
    "Padma","Sunil","Radha","Ajay","Mala","Vinod","Sarala","Harish"
]

LAST_NAMES = [
    "Menon","Sharma","Patel","Nair","Reddy","Singh","Iyer","Pillai",
    "Verma","Kumar","Gupta","Rao","Joshi","Mishra","Chandra","Bhat",
    "Krishnan","Saxena","Tiwari","Pandey","Malik","Shah","Desai","Mehta"
]

def fake_password_hash(username):
    return hashlib.sha256(f"MedTrust@2026#{username}".encode()).hexdigest()

def fake_token(user_id):
    return hashlib.sha256(f"{user_id}{random.random()}".encode()).hexdigest()

print("=== Creating ZTA/IAM additional tables ===")
with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS devices (
            id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id           UUID NOT NULL,
            device_name         VARCHAR(128),
            mac_address         VARCHAR(17) UNIQUE,
            ip_address          VARCHAR(15),
            os                  VARCHAR(64),
            os_version          VARCHAR(32),
            patch_level         VARCHAR(16),
            compliance_status   VARCHAR(32),
            owner_user_id       UUID,
            registered_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS auth_logs (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id       UUID NOT NULL,
            user_id         UUID,
            device_id       UUID,
            action          VARCHAR(64),
            mfa_passed      BOOLEAN,
            opa_decision    VARCHAR(16),
            policy_rule     VARCHAR(128),
            source_ip       VARCHAR(15),
            logged_at       TIMESTAMP WITH TIME ZONE
        );
    """))
    conn.commit()
print("  Tables created: devices, auth_logs")

# ── STEP 1: Seed roles ────────────────────────────────────────
print("\n=== Seeding roles ===")
role_ids = {}
with engine.connect() as conn:
    for tenant_id in [TENANT_GENERAL, TENANT_OUTPATIENT]:
        for role_name, role_desc, _ in ROLES:
            role_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO roles (id, tenant_id, name, description)
                VALUES (:id, :tenant_id, :name, :description)
                ON CONFLICT DO NOTHING
            """), {"id": role_id, "tenant_id": tenant_id,
                   "name": role_name, "description": role_desc})
            role_ids[(tenant_id, role_name)] = role_id
    conn.commit()
print(f"  Inserted {len(role_ids)} roles across 2 tenants")

# ── STEP 2: Seed users (hospital staff) ───────────────────────
print("\n=== Seeding 300 hospital staff users ===")
user_ids = []
tenant_cycle = [TENANT_GENERAL] * 210 + [TENANT_OUTPATIENT] * 90
random.shuffle(tenant_cycle)

role_weights = [
    ("Doctor", 25), ("Nurse", 35), ("IT_Admin", 10),
    ("Pharmacist", 10), ("Board_Member", 5), ("Radiologist", 5),
    ("Lab_Tech", 5), ("Receptionist", 5)
]
role_pool = [r for r, w in role_weights for _ in range(w)]

with engine.connect() as conn:
    for i in range(300):
        tenant_id = tenant_cycle[i]
        first = random.choice(FIRST_NAMES)
        last  = random.choice(LAST_NAMES)
        role  = random.choice(role_pool)
        dept  = random.choice(DEPARTMENTS)
        uid   = str(uuid.uuid4())
        username = f"{first.lower()}.{last.lower()}{i}"
        email    = f"{username}@medtrustx.hospital"
        status   = "active" if random.random() > 0.05 else "inactive"

        conn.execute(text("""
            INSERT INTO users (id, tenant_id, username, email, password_hash, status)
            VALUES (:id, :tenant_id, :username, :email, :password_hash, :status)
            ON CONFLICT DO NOTHING
        """), {"id": uid, "tenant_id": tenant_id, "username": username,
               "email": email, "password_hash": fake_password_hash(username),
               "status": status})

        role_id = role_ids.get((tenant_id, role))
        if role_id:
            conn.execute(text("""
                INSERT INTO user_roles (user_id, role_id, tenant_id)
                VALUES (:user_id, :role_id, :tenant_id)
                ON CONFLICT DO NOTHING
            """), {"user_id": uid, "role_id": role_id, "tenant_id": tenant_id})

        user_ids.append((uid, tenant_id, role, dept))

    conn.commit()
print(f"  Inserted 300 users with role assignments")

# ── STEP 3: Seed device inventory ─────────────────────────────
print("\n=== Seeding 400 devices ===")
OS_PROFILES = [
    ("iPad",        "iPadOS",   "17.4",  "current",  "compliant"),
    ("MacBook",     "macOS",    "14.3",  "current",  "compliant"),
    ("Windows PC",  "Windows",  "11",    "current",  "compliant"),
    ("Android",     "Android",  "14",    "current",  "compliant"),
    ("Windows PC",  "Windows",  "10",    "outdated", "missing_av"),
    ("iPhone",      "iOS",      "16.1",  "outdated", "missing_av"),
    ("iPad",        "iPadOS",   "15.0",  "outdated", "jailbroken"),
    ("Unknown",     "Unknown",  "?",     "none",     "unregistered"),
]

STATUS_WEIGHTS = [
    ("compliant", 65), ("missing_av", 15),
    ("jailbroken", 10), ("unregistered", 10)
]
status_pool = [s for s, w in STATUS_WEIGHTS for _ in range(w)]

device_ids = []
used_macs  = set()

with engine.connect() as conn:
    for i in range(400):
        owner = random.choice(user_ids)
        uid, tenant_id, role, dept = owner
        profile = random.choice(OS_PROFILES)
        dev_name, os_name, os_ver, patch, _ = profile
        compliance = random.choice(status_pool)

        while True:
            mac = ":".join(f"{random.randint(0,255):02X}" for _ in range(6))
            if mac not in used_macs:
                used_macs.add(mac)
                break

        ip  = f"10.{random.randint(0,3)}.{random.randint(1,254)}.{random.randint(1,254)}"
        did = str(uuid.uuid4())

        conn.execute(text("""
            INSERT INTO devices (
                id, tenant_id, device_name, mac_address, ip_address,
                os, os_version, patch_level, compliance_status, owner_user_id
            ) VALUES (
                :id, :tenant_id, :device_name, :mac_address, :ip_address,
                :os, :os_version, :patch_level, :compliance_status, :owner_user_id
            ) ON CONFLICT (mac_address) DO NOTHING
        """), {"id": did, "tenant_id": tenant_id, "device_name": dev_name,
               "mac_address": mac, "ip_address": ip, "os": os_name,
               "os_version": os_ver, "patch_level": patch,
               "compliance_status": compliance, "owner_user_id": uid})

        device_ids.append((did, tenant_id))
    conn.commit()
print(f"  Inserted 400 devices")

# ── STEP 4: Seed sessions + auth logs (30 days) ───────────────
print("\n=== Seeding 30 days of auth logs ===")
now      = datetime.utcnow()
actions  = ["login_attempt", "mfa_challenge", "token_refresh", "logout"]
policies = ["physician_access", "nurse_access", "admin_access",
            "pharmacy_access", "board_access", "device_trust_check"]

log_count = 0
with engine.connect() as conn:
    for day in range(30):
        day_start = now - timedelta(days=30 - day)
        events_per_day = random.randint(400, 600)

        for _ in range(events_per_day):
            user   = random.choice(user_ids)
            device = random.choice(device_ids)
            uid, tenant_id, role, dept = user
            did, _ = device

            ts          = day_start + timedelta(seconds=random.randint(0, 86400))
            action      = random.choice(actions)
            mfa_passed  = random.random() > 0.08
            opa_decision= "allow" if mfa_passed and random.random() > 0.05 else "deny"
            policy      = random.choice(policies)
            source_ip   = f"10.{random.randint(0,3)}.{random.randint(1,254)}.{random.randint(1,254)}"

            conn.execute(text("""
                INSERT INTO auth_logs (
                    id, tenant_id, user_id, device_id, action,
                    mfa_passed, opa_decision, policy_rule, source_ip, logged_at
                ) VALUES (
                    :id, :tenant_id, :user_id, :device_id, :action,
                    :mfa_passed, :opa_decision, :policy_rule, :source_ip, :logged_at
                )
            """), {"id": str(uuid.uuid4()), "tenant_id": tenant_id,
                   "user_id": uid, "device_id": did, "action": action,
                   "mfa_passed": mfa_passed, "opa_decision": opa_decision,
                   "policy_rule": policy, "source_ip": source_ip,
                   "logged_at": ts})
            log_count += 1

        # Seed sessions for active users
        for user in random.sample(user_ids, 20):
            uid, tenant_id, _, _ = user
            conn.execute(text("""
                INSERT INTO sessions (id, tenant_id, user_id, token, expires_at)
                VALUES (:id, :tenant_id, :user_id, :token, :expires_at)
                ON CONFLICT DO NOTHING
            """), {"id": str(uuid.uuid4()), "tenant_id": tenant_id,
                   "user_id": uid, "token": fake_token(uid),
                   "expires_at": day_start + timedelta(hours=8)})

    conn.commit()
print(f"  Inserted {log_count} auth log events")

# ── STEP 5: Verify ────────────────────────────────────────────
print("\n=== Verification ===")
with engine.connect() as conn:
    u  = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
    r  = conn.execute(text("SELECT COUNT(*) FROM roles")).scalar()
    ur = conn.execute(text("SELECT COUNT(*) FROM user_roles")).scalar()
    s  = conn.execute(text("SELECT COUNT(*) FROM sessions")).scalar()
    d  = conn.execute(text("SELECT COUNT(*) FROM devices")).scalar()
    al = conn.execute(text("SELECT COUNT(*) FROM auth_logs")).scalar()
    blocked = conn.execute(text("SELECT COUNT(*) FROM auth_logs WHERE opa_decision='deny'")).scalar()
    jailbroken = conn.execute(text("SELECT COUNT(*) FROM devices WHERE compliance_status='jailbroken'")).scalar()
    compliant  = conn.execute(text("SELECT COUNT(*) FROM devices WHERE compliance_status='compliant'")).scalar()

print(f"  users              : {u}")
print(f"  roles              : {r}")
print(f"  user_role mappings : {ur}")
print(f"  sessions           : {s}")
print(f"  devices total      : {d}")
print(f"    compliant        : {compliant}")
print(f"    jailbroken       : {jailbroken}")
print(f"  auth_logs total    : {al}")
print(f"    blocked (deny)   : {blocked}")
print("\nZTA & IAM seeding complete!")
