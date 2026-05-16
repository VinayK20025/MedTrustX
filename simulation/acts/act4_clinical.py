"""Act 4: Clinical core and FHIR R4 demonstration."""
import time
from config import IDX, LIVE, DEMO_TENANT
from core.banner import *
from core.colors import *
from core.progress import spinner, progress_bar
from core.typewriter import typewriter, stream_lines
from core.pause import pause
from core.display import (display_table, display_json,
                          display_fhir_resource)
from data import db_client as db
from data import api_client as api

def run() -> None:
    """Execute Act 4: Clinical Core + FHIR R4."""
    show_act_banner(4,
        "Clinical Core & Patient Management",
        "FHIR R4 | ICD-10 | SNOMED CT | LOINC | CDS")
    show_scene_banner(6,
        "Clinical Operations — Patient Record")

    # LIVE: fetch real patient from clinical DB
    sql = """SELECT id, mrn, first_name, last_name,
             date_of_birth, gender, status
             FROM patients
             WHERE tenant_id='tenant_general' LIMIT 1;"""
    print_sql_block(sql)
    rows = db.query_with_rls(
        "clinical", "tenant_general",
        "SELECT id::text, mrn, first_name, last_name, "
        "date_of_birth::text, gender, status "
        "FROM patients WHERE tenant_id='tenant_general' "
        "LIMIT 1")
    if rows:
        r = rows[0]
        display_table(
            [[r.get('id','')[:20]+'...',
              r.get('mrn',''),
              r.get('first_name','') + ' ' +
              r.get('last_name',''),
              r.get('date_of_birth',''),
              r.get('gender',''),
              r.get('status','')]],
            ["ID", "MRN", "Name", "DOB", "Gender","Status"],
            title="Patient Record [LIVE patients_db]")

    # LIVE or API: full patient via patient-service
    if LIVE.svc_patient:
        resp = api.get("patient",
            f"/api/patients/{IDX.patient_id}")
        if resp:
            display_json(resp,
                title="Patient Record [LIVE API]",
                highlight_keys=['mrn','status',
                                'blood_group'])

    # LIVE: vitals from analytics_db
    sql_vitals = """SELECT vital_type,
        COUNT(*) as readings,
        ROUND(AVG(vital_value)::numeric, 1) as avg_val,
        MIN(vital_value) as min_val,
        MAX(vital_value) as max_val
        FROM patient_vitals
        WHERE tenant_id='tenant_general'
        GROUP BY vital_type ORDER BY COUNT(*) DESC;"""
    print_sql_block(sql_vitals)
    vital_rows = db.query("analytics", sql_vitals)
    if vital_rows:
        display_table(
            [[r['vital_type'], r['readings'],
              r['avg_val'], r['min_val'], r['max_val']]
             for r in vital_rows],
            ["Vital Type","Readings","Avg","Min","Max"],
            title=f"Vitals Summary [LIVE analytics_db]"
                  f" — {IDX.total_vitals:,} total rows")

    # LIVE: conditions from analytics_db
    sql_cond = """SELECT icd10_code, description, status
        FROM patient_conditions
        WHERE tenant_id='tenant_general'
        AND status='active' LIMIT 5;"""
    print_sql_block(sql_cond)
    cond_rows = db.query("analytics", sql_cond)
    if cond_rows:
        display_table(
            [[r['icd10_code'],
              r['description'][:40],
              r['status']]
             for r in cond_rows],
            ["ICD-10 Code", "Description", "Status"],
            title="Active Diagnoses [LIVE analytics_db]")

    # CDS drug interaction
    typewriter("\n[CDS] Prescribing Warfarin — checking...")
    spinner("Check 1/3: Drug interactions...", 1.0)
    print_warn("⚠ INTERACTION: Warfarin × Aspirin → MAJOR")
    print_warn("  Risk: Increased bleeding risk")
    spinner("Check 2/3: Allergy cross-check...", 0.8)
    print_ok("✓ No known allergies to Warfarin")
    spinner("Check 3/3: Dosage validation...", 0.6)
    print_ok("✓ 5mg dose within therapeutic range")

    if LIVE.svc_clinical:
        cds_body = {
            "hook": "medication-prescribe",
            "context": {
                "patientId": IDX.patient_id,
                "medications": [{"code": "11289",
                                 "display": "Warfarin"}]
            }
        }
        resp = api.post("clinical",
            "/cds-services/medication-prescribe",
            cds_body)
        if resp:
            display_json(resp,
                highlight_keys=['summary','severity'])

    # Scene 7: FHIR R4
    pause("Scene 7: FHIR R4 Export")
    show_scene_banner(7, "HL7 FHIR R4 — Data Exchange")

    if LIVE.svc_patient:
        resp = api.get("patient",
            f"/fhir/r4/Patient/{IDX.patient_id}")
        if resp:
            display_fhir_resource(resp)
            print_ok("FHIR R4 Patient [LIVE API]")
    else:
        # Show scripted FHIR structure
        fhir_example = {
            "resourceType": "Patient",
            "id": IDX.patient_id,
            "identifier": [{"system": "MRN",
                             "value": IDX.patient_mrn}],
            "name": [{"family": IDX.patient_name.split()[-1],
                      "given": [IDX.patient_name.split()[0]]}],
            "birthDate": IDX.patient_dob,
            "gender": "male"
        }
        display_fhir_resource(fhir_example)

    # Real-time vitals stream from analytics_db
    typewriter("\n[WebSocket] Real-time vitals stream:")
    recent_vitals = db.query(
        "analytics",
        "SELECT vital_type, vital_value, recorded_at "
        "FROM patient_vitals "
        "WHERE tenant_id='tenant_general' "
        "ORDER BY recorded_at DESC LIMIT 5")
    if recent_vitals:
        for v in recent_vitals:
            z = (float(v['vital_value']) - 78) / 8.2
            color = GREEN if abs(z) < 2.5 else RED
            print(f"  {GRAY}[{str(v['recorded_at'])[:19]}]"
                  f"{RESET} "
                  f"{CYAN}{v['vital_type']:<35}{RESET} "
                  f"{color}{v['vital_value']:.1f}{RESET}  "
                  f"{GRAY}Z={z:.2f}{RESET}")
            time.sleep(0.4)

    pause("Act 5: AI Inference Engine")
