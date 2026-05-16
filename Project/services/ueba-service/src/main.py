from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

from .config import config

app = FastAPI(title="UEBA Service - MedTrustX", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": config.SERVICE_NAME}

# Mocked state for UEBA logic
MOCK_USERS = ["dr_smith", "dr_jones", "admin_user", "nurse_ratched", "it_support_1"]
MOCK_ENTITIES = ["Server-DB-1", "Router-Core", "IoT-MRI-Scanner", "VPN-Gateway", "NAS-Storage"]

def generate_mock_anomalies() -> List[Dict[str, Any]]:
    anomalies = []
    for _ in range(5):
        is_user = random.choice([True, False])
        target = random.choice(MOCK_USERS) if is_user else random.choice(MOCK_ENTITIES)
        anomalies.append({
            "id": f"anom-{random.randint(1000, 9999)}",
            "timestamp": (datetime.utcnow() - timedelta(minutes=random.randint(1, 120))).isoformat(),
            "targetType": "user" if is_user else "entity",
            "targetId": target,
            "severity": random.choice(["low", "medium", "high", "critical"]),
            "anomalyType": random.choice([
                "unusual_login_location",
                "excessive_data_download",
                "privilege_escalation_attempt",
                "abnormal_file_access",
                "unexpected_protocol_usage"
            ]),
            "description": f"Detected abnormal behavior pattern from {target}",
            "riskScoreDelta": random.randint(10, 40)
        })
    return anomalies

def generate_mock_risk_scores() -> List[Dict[str, Any]]:
    scores = []
    targets = MOCK_USERS + MOCK_ENTITIES
    for target in targets:
        score = random.randint(1, 99)
        scores.append({
            "targetId": target,
            "targetType": "user" if target in MOCK_USERS else "entity",
            "currentRiskScore": score,
            "riskLevel": "critical" if score >= 80 else "high" if score >= 60 else "medium" if score >= 40 else "low",
            "lastUpdated": datetime.utcnow().isoformat(),
            "peerGroup": "medical_staff" if target in MOCK_USERS else "infrastructure",
            "baselineDeviation": random.randint(0, 100) / 10.0
        })
    return sorted(scores, key=lambda x: x["currentRiskScore"], reverse=True)

@app.get("/api/v1/ueba/risk-scores")
def get_risk_scores(targetType: str = None):
    scores = generate_mock_risk_scores()
    if targetType:
        scores = [s for s in scores if s["targetType"] == targetType]
    return {
        "items": scores,
        "total": len(scores)
    }

@app.get("/api/v1/ueba/anomalies")
def get_anomalies():
    anomalies = generate_mock_anomalies()
    return {
        "items": anomalies,
        "total": len(anomalies)
    }

@app.get("/api/v1/ueba/baselines")
def get_baselines():
    return {
        "items": [
            {
                "id": f"baseline-{random.randint(100, 999)}",
                "peerGroup": "medical_staff",
                "typicalLoginHours": "08:00-18:00",
                "avgDailyDataTransferMB": 150,
                "commonLocations": ["Hospital_Internal_Network", "VPN_US_East"],
                "lastTrained": (datetime.utcnow() - timedelta(days=1)).isoformat()
            },
            {
                "id": f"baseline-{random.randint(100, 999)}",
                "peerGroup": "infrastructure",
                "typicalLoginHours": "24/7",
                "avgDailyDataTransferMB": 50000,
                "commonLocations": ["Data_Center_A", "AWS_VPC_1"],
                "lastTrained": (datetime.utcnow() - timedelta(hours=12)).isoformat()
            }
        ],
        "total": 2
    }

@app.post("/api/v1/ueba/events")
def ingest_event(event: Dict[str, Any]):
    # In a real system, this would push to Kafka for real-time risk evaluation
    return {
        "status": "ingested",
        "eventId": f"evt-{random.randint(10000, 99999)}",
        "timestamp": datetime.utcnow().isoformat(),
        "processingLatencyMs": random.randint(5, 50)
    }
