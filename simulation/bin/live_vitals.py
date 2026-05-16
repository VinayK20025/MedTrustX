"""Script to generate realistic patient vitals and insert to DB."""
import os
import sys
import time
import random
from datetime import datetime

sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))

from data import db_client as db

def main() -> None:
    """Generate and insert random vitals into analytics_db."""
    print("Starting live vitals generator...")
    vital_types = [
        ("Heart rate", 60, 100),
        ("Systolic BP", 110, 140),
        ("Diastolic BP", 70, 90),
        ("Temperature", 97.5, 99.5),
        ("O2 Saturation", 95, 100)
    ]
    try:
        while True:
            vt, vmin, vmax = random.choice(vital_types)
            val = random.uniform(vmin, vmax)
            # Create occasional anomalies
            if random.random() < 0.05:
                val = val * 1.3

            sql = """INSERT INTO patient_vitals
                (tenant_id, patient_id, encounter_id,
                 vital_type, vital_value, recorded_at)
                VALUES (%s, %s, %s, %s, %s, %s)"""
            params = (
                "tenant_general",
                "00000000-0000-0000-0000-000000000000",
                "00000000-0000-0000-0000-000000000000",
                vt, val, datetime.now()
            )
            # Fail silently to avoid spam
            try:
                conn = db.get_connection("analytics")
                if conn:
                    with conn.cursor() as cur:
                        cur.execute(sql, params)
            except Exception:
                pass

            time.sleep(1.5)
    except KeyboardInterrupt:
        sys.exit(0)

if __name__ == "__main__":
    main()
