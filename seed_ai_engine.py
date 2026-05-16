import pandas as pd
from sqlalchemy import create_engine, text
import os, json, numpy as np

DB_URL = "postgresql://medtrust_analytics_admin:analytics_db_secret_2026@localhost:5435/analytics_db"
CSV_DIR = os.path.expanduser("~/MedTrustX/output/csv")

engine = create_engine(DB_URL)

# ── STEP 1: Create tables ─────────────────────────────────────
print("=== Creating AI Engine tables ===")
with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS patient_vitals (
            id              SERIAL PRIMARY KEY,
            patient_id      VARCHAR(64) NOT NULL,
            tenant_id       VARCHAR(20) NOT NULL,
            recorded_at     TIMESTAMP NOT NULL,
            vital_type      VARCHAR(64),
            vital_value     FLOAT,
            vital_unit      VARCHAR(32)
        );

        CREATE TABLE IF NOT EXISTS patient_conditions (
            id              SERIAL PRIMARY KEY,
            patient_id      VARCHAR(64) NOT NULL,
            tenant_id       VARCHAR(20) NOT NULL,
            icd10_code      VARCHAR(64),
            description     TEXT,
            onset_date      DATE,
            status          VARCHAR(32) DEFAULT 'active'
        );

        CREATE TABLE IF NOT EXISTS readmission_risk (
            id              SERIAL PRIMARY KEY,
            patient_id      VARCHAR(64) NOT NULL,
            tenant_id       VARCHAR(20) NOT NULL,
            risk_score      FLOAT,
            risk_label      VARCHAR(16),
            num_conditions  INT,
            num_encounters  INT,
            age             INT,
            computed_at     TIMESTAMP DEFAULT NOW()
        );
    """))
    conn.commit()
print("  Tables created.")

# ── STEP 2: Load vitals (observations.csv) ────────────────────
print("\n=== Loading vitals from observations.csv ===")
obs = pd.read_csv(f"{CSV_DIR}/observations.csv", low_memory=False)
obs.columns = [c.upper() for c in obs.columns]

# Filter only numeric vitals
vital_types = [
    "Heart rate", "Diastolic Blood Pressure",
    "Systolic Blood Pressure", "Oxygen saturation in Arterial blood",
    "Body Weight", "Body Height", "Body Mass Index"
]
obs = obs[obs["DESCRIPTION"].isin(vital_types)].copy()
obs = obs[pd.to_numeric(obs["VALUE"], errors="coerce").notna()].copy()

# Assign tenant_id same way as patients (first 700 unique patients)
patients_csv = pd.read_csv(f"{CSV_DIR}/patients.csv", low_memory=False)
patient_ids = patients_csv["Id"].tolist()
tenant_map = {pid: ("tenant_general" if i < 700 else "tenant_outpatient")
              for i, pid in enumerate(patient_ids)}

obs["tenant_id"] = obs["PATIENT"].map(tenant_map).fillna("tenant_general")

vitals_rows = []
for _, row in obs.iterrows():
    vitals_rows.append({
        "patient_id":   str(row["PATIENT"]),
        "tenant_id":    row["tenant_id"],
        "recorded_at":  row["DATE"],
        "vital_type":   str(row["DESCRIPTION"]),
        "vital_value":  float(row["VALUE"]),
        "vital_unit":   str(row["UNITS"]) if pd.notna(row.get("UNITS")) else None
    })

print(f"  Inserting {len(vitals_rows)} vital records...")
vitals_df = pd.DataFrame(vitals_rows)
vitals_df.to_sql("patient_vitals", engine, if_exists="append", index=False)
print("  Vitals loaded.")

# ── STEP 3: Load conditions (conditions.csv) ──────────────────
print("\n=== Loading ICD-10 conditions ===")
cond = pd.read_csv(f"{CSV_DIR}/conditions.csv", low_memory=False)
cond.columns = [c.upper() for c in cond.columns]
cond["tenant_id"] = cond["PATIENT"].map(tenant_map).fillna("tenant_general")

cond_rows = []
for _, row in cond.iterrows():
    cond_rows.append({
        "patient_id":  str(row["PATIENT"]),
        "tenant_id":   row["tenant_id"],
        "icd10_code":  str(row["CODE"]) if pd.notna(row.get("CODE")) else None,
        "description": str(row["DESCRIPTION"]) if pd.notna(row.get("DESCRIPTION")) else None,
        "onset_date":  row["START"] if pd.notna(row.get("START")) else None,
        "status":      "resolved" if pd.notna(row.get("STOP")) else "active"
    })

print(f"  Inserting {len(cond_rows)} condition records...")
cond_df = pd.DataFrame(cond_rows)
cond_df.to_sql("patient_conditions", engine, if_exists="append", index=False)
print("  Conditions loaded.")

# ── STEP 4: Compute readmission risk scores ───────────────────
print("\n=== Computing readmission risk scores ===")
enc = pd.read_csv(f"{CSV_DIR}/encounters.csv", low_memory=False)
enc.columns = [c.upper() for c in enc.columns]

# Count encounters per patient
enc_counts = enc.groupby("PATIENT").size().reset_index(name="num_encounters")

# Count conditions per patient
cond_counts = cond_df.groupby("patient_id").size().reset_index(name="num_conditions")
cond_counts.rename(columns={"patient_id": "PATIENT"}, inplace=True)

# Patient ages
patients_csv["age"] = pd.to_datetime("today").year - pd.to_datetime(
    patients_csv["BIRTHDATE"], errors="coerce").dt.year

risk_df = patients_csv[["Id", "age"]].copy()
risk_df = risk_df.merge(enc_counts,   left_on="Id", right_on="PATIENT", how="left")
risk_df = risk_df.merge(cond_counts,  left_on="Id", right_on="PATIENT", how="left")
risk_df["num_encounters"]  = risk_df["num_encounters"].fillna(0).astype(int)
risk_df["num_conditions"]  = risk_df["num_conditions"].fillna(0).astype(int)
risk_df["age"]             = risk_df["age"].fillna(40).astype(int)
risk_df["tenant_id"]       = risk_df["Id"].map(tenant_map).fillna("tenant_general")

# Risk score formula: weighted sum normalized to 0-1
risk_df["risk_score"] = (
    (risk_df["num_conditions"] * 0.4) +
    (risk_df["num_encounters"] * 0.1) +
    (risk_df["age"].clip(0, 90)  * 0.005)
)
max_score = risk_df["risk_score"].max()
risk_df["risk_score"] = (risk_df["risk_score"] / max_score).round(4)
risk_df["risk_label"] = pd.cut(
    risk_df["risk_score"],
    bins=[0, 0.33, 0.66, 1.0],
    labels=["low", "medium", "high"]
)

risk_rows = risk_df[["Id","tenant_id","risk_score","risk_label",
                      "num_conditions","num_encounters","age"]].copy()
risk_rows.columns = ["patient_id","tenant_id","risk_score","risk_label",
                     "num_conditions","num_encounters","age"]

print(f"  Inserting {len(risk_rows)} risk scores...")
risk_rows.to_sql("readmission_risk", engine, if_exists="append", index=False)
print("  Risk scores computed.")

# ── STEP 5: Verify ────────────────────────────────────────────
print("\n=== Verification ===")
with engine.connect() as conn:
    v = conn.execute(text("SELECT COUNT(*) FROM patient_vitals")).scalar()
    c = conn.execute(text("SELECT COUNT(*) FROM patient_conditions")).scalar()
    r = conn.execute(text("SELECT COUNT(*) FROM readmission_risk")).scalar()
    high = conn.execute(text("SELECT COUNT(*) FROM readmission_risk WHERE risk_label='high'")).scalar()
    med  = conn.execute(text("SELECT COUNT(*) FROM readmission_risk WHERE risk_label='medium'")).scalar()
    low  = conn.execute(text("SELECT COUNT(*) FROM readmission_risk WHERE risk_label='low'")).scalar()

print(f"  patient_vitals     : {v} rows")
print(f"  patient_conditions : {c} rows")
print(f"  readmission_risk   : {r} rows")
print(f"    high risk        : {high} patients")
print(f"    medium risk      : {med} patients")
print(f"    low risk         : {low} patients")
print("\nAI Engine seeding complete!")
