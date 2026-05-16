import pandas as pd
from sqlalchemy import create_engine, text
import uuid, os, json

DB_URL = "postgresql://medtrust_clinical_admin:clinical_db_secret_2026@localhost:5432/patients_db"
CSV_DIR = os.path.expanduser("~/MedTrustX/output/csv")

engine = create_engine(DB_URL)

print("=== Loading Synthea patients.csv ===")
df = pd.read_csv(f"{CSV_DIR}/patients.csv", low_memory=False)
print(f"Loaded {len(df)} rows from Synthea")

def map_patient(row, tenant_id):
    return {
        "id":                str(uuid.uuid4()),
        "tenant_id":         tenant_id,
        "mrn":               str(row["Id"])[:32],
        "first_name":        str(row["FIRST"])[:128],
        "last_name":         str(row["LAST"])[:128],
        "date_of_birth":     row["BIRTHDATE"] if pd.notna(row["BIRTHDATE"]) else None,
        "gender":            str(row["GENDER"])[:16] if pd.notna(row["GENDER"]) else None,
        "blood_group":       None,
        "phone":             None,
        "email":             str(row["Id"])[:40] + "@synthetic.medtrustx.local",
        "address":           json.dumps({"street": str(row.get("ADDRESS","")), "city": str(row.get("CITY","")), "state": str(row.get("STATE","")), "zip": str(row.get("ZIP",""))}),
        "emergency_contact": json.dumps({}),
        "insurance_info":    json.dumps({"payer": str(row.get("PAYER","Unknown"))}),
        "status":            "active"
    }

records = []
for i, row in df.iterrows():
    tenant = "tenant_general" if i < 700 else "tenant_outpatient"
    records.append(map_patient(row, tenant))

print(f"\n=== Inserting {len(records)} patients ===")
with engine.connect() as conn:
    conn.execute(text("SET app.tenant_id = 'tenant_general'"))
    inserted = 0
    skipped  = 0
    for r in records:
        try:
            conn.execute(text("""
                INSERT INTO patients (
                    id, tenant_id, mrn, first_name, last_name,
                    date_of_birth, gender, blood_group, phone, email,
                    address, emergency_contact, insurance_info, status
                ) VALUES (
                    :id, :tenant_id, :mrn, :first_name, :last_name,
                    :date_of_birth, :gender, :blood_group, :phone, :email,
                    CAST(:address AS jsonb), CAST(:emergency_contact AS jsonb),
                    CAST(:insurance_info AS jsonb), :status
                )
                ON CONFLICT (tenant_id, mrn) DO NOTHING
            """), r)
            inserted += 1
            if inserted % 100 == 0:
                print(f"  {inserted} inserted...")
        except Exception as e:
            skipped += 1
    conn.commit()

print(f"\n  Done — inserted: {inserted}, skipped: {skipped}")

print("\n=== Verification ===")
with engine.connect() as conn:
    rows = conn.execute(text("""
        SELECT tenant_id, COUNT(*) as count
        FROM patients GROUP BY tenant_id ORDER BY tenant_id
    """)).fetchall()
for r in rows:
    print(f"  {r[0]:<22} → {r[1]} patients")

print("\nSeeding complete!")
