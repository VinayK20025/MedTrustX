"""Act 5: AI inference and analytics demonstration."""
import time
from config import IDX, LIVE, DEMO_TENANT
from core.banner import *
from core.colors import *
from core.progress import (progress_bar, spinner,
                           draw_risk_meter, draw_bar_chart)
from core.typewriter import typewriter
from core.pause import pause
from core.display import display_table, display_json
from data import db_client as db
from data import api_client as api

def run() -> None:
    """Execute Act 5: AI Engine."""
    show_act_banner(5, "AI-Driven Inference & Analytics",
        "TF Serving | MLflow | SHAP | 221K Observations")
    show_scene_banner(8, "AI Inference — Readmission Risk")

    # LIVE: dataset scale
    sql_inv = """SELECT
        (SELECT COUNT(*) FROM patient_vitals) as vitals,
        (SELECT COUNT(*) FROM patient_conditions) as conditions,
        (SELECT COUNT(*) FROM readmission_risk) as risks,
        (SELECT COUNT(*) FROM readmission_risk
         WHERE risk_label='high') as high_risk;"""
    print_sql_block(sql_inv)
    inv_rows = db.query("analytics", sql_inv)
    if inv_rows:
        r = inv_rows[0]
        display_table(
            [["patient_vitals",    r.get('vitals',0)],
             ["patient_conditions",r.get('conditions',0)],
             ["readmission_risk",  r.get('risks',0)],
             ["high_risk_patients",r.get('high_risk',0)]],
            ["Table", "Row Count"],
            title="AI Dataset [LIVE analytics_db]")

    # LIVE: highest risk patient
    sql_risk = """SELECT patient_id, risk_score,
        risk_label, num_conditions, num_encounters, age
        FROM readmission_risk
        ORDER BY risk_score DESC LIMIT 3;"""
    print_sql_block(sql_risk)
    risk_rows = db.query("analytics", sql_risk)
    if risk_rows:
        display_table(
            [[str(r['patient_id'])[:20]+'...',
              f"{r['risk_score']:.3f}",
              r['risk_label'],
              r['num_conditions'],
              r['num_encounters'],
              r['age']]
             for r in risk_rows],
            ["Patient ID", "Risk Score", "Label",
             "Conditions", "Encounters", "Age"],
            title="Top Risk Patients [LIVE]")

    # LIVE or API: AI inference
    if LIVE.svc_ai:
        body = {"patient_id": IDX.patient_id,
                "tenant_id": DEMO_TENANT}
        resp = api.post("ai",
            "/api/ai/predict-readmission", body)
        if resp:
            display_json(resp,
                highlight_keys=['risk_score',
                                'risk_label',
                                'confidence',
                                'model_version'])
            score = float(resp.get('risk_score',
                                   IDX.risk_score))
            draw_risk_meter(score, "Readmission Risk")
    else:
        spinner("POST /api/ai/predict-readmission...", 1.5)
        draw_risk_meter(IDX.risk_score, "Readmission Risk")
        typewriter("SHAP top features:")
        print_result("  charlson_index",  "+0.18", RED)
        print_result("  num_encounters",  "+0.12", YELLOW)
        print_result("  avg_systolic_bp", "+0.08", YELLOW)

    # LIVE: risk distribution
    sql_dist = """SELECT risk_label,
        COUNT(*) as patients,
        ROUND(AVG(risk_score)::numeric, 3) as avg_score
        FROM readmission_risk
        GROUP BY risk_label ORDER BY avg_score DESC;"""
    print_sql_block(sql_dist)
    dist_rows = db.query("analytics", sql_dist)
    if dist_rows:
        display_table(
            [[r['risk_label'], r['patients'],
              r['avg_score']] for r in dist_rows],
            ["Risk Label","Patients","Avg Score"],
            title="Risk Distribution [LIVE]")
        data = [(r['risk_label'], int(r['patients']))
                for r in dist_rows]
        draw_bar_chart(data)

    # Scene 9: Anomaly detection
    pause("Scene 9: Vitals Anomaly Detection")
    show_scene_banner(9, "AI Anomaly Detection")

    # LIVE: anomalous vitals
    sql_anom = """SELECT vital_type, vital_value,
        recorded_at FROM patient_vitals
        WHERE vital_type = 'Heart rate'
        AND vital_value > 120
        ORDER BY vital_value DESC LIMIT 5;"""
    print_sql_block(sql_anom)
    anom_rows = db.query("analytics", sql_anom)
    if anom_rows:
        display_table(
            [[r['vital_type'],
              f"{r['vital_value']:.1f}",
              str(r['recorded_at'])[:19]]
             for r in anom_rows],
            ["Vital Type","Value","Recorded At"],
            title="Anomalous Vitals [LIVE analytics_db]")

    if LIVE.svc_ai:
        body = {"patient_id": IDX.patient_id,
                "tenant_id":  DEMO_TENANT,
                "lookback_hours": 24}
        resp = api.post("ai",
            "/api/ai/vitals-anomaly", body)
        if resp:
            display_json(resp,
                highlight_keys=['severity','anomalies'])

    # LIVE: hourly vitals distribution
    sql_hourly = """SELECT
        EXTRACT(HOUR FROM recorded_at)::int as hour,
        COUNT(*) as readings
        FROM patient_vitals GROUP BY hour
        ORDER BY hour;"""
    hourly_rows = db.query("analytics", sql_hourly)
    if hourly_rows:
        typewriter("\nVitals volume by hour:")
        data = [(f"{r['hour']:02d}:00", int(r['readings']))
                for r in hourly_rows]
        draw_bar_chart(data, max_width=30)

    pause("Act 6: GRC & Audit Infrastructure")
