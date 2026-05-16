"""
Patient Record Aggregator.
"""
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import json

from app.db.repositories.patient_repo import PatientRepository
from app.db.repositories.observation_repo import ObservationRepository
from app.db.repositories.condition_repo import ConditionRepository
from app.db.repositories.encounter_repo import EncounterRepository
from app.models.patient import ClinicalRecord

tracer = trace.get_tracer(__name__)

class RecordAggregator:
    def __init__(self, session: AsyncSession, redis_client):
        self.session = session
        self.redis = redis_client
        self.patient_repo = PatientRepository(session)
        self.obs_repo = ObservationRepository(session)
        self.cond_repo = ConditionRepository(session)
        self.enc_repo = EncounterRepository(session)

    async def get_full_record(self, tenant_id: str, patient_id: str) -> Optional[ClinicalRecord]:
        with tracer.start_as_current_span("record.aggregate"):
            cache_key = f"medtrust:patient:record:{patient_id}"
            cached = await self.redis.get(cache_key)
            if cached:
                return ClinicalRecord(**json.loads(cached))

            patient = await self.patient_repo.get_patient_by_id(tenant_id, patient_id)
            if not patient:
                return None
                
            vitals = await self.obs_repo.get_patient_observations(tenant_id, patient_id, days=90)
            conditions = await self.cond_repo.get_patient_conditions(tenant_id, patient_id)
            encounters = await self.enc_repo.get_patient_encounters(tenant_id, patient_id, limit=10)
            
            medications = []
            allergies = []
            procedures = []
            careplans = []
            
            for d in [patient]:
                d["id"] = str(d["id"])
                if d.get("date_of_birth"):
                    d["date_of_birth"] = str(d["date_of_birth"])
                if d.get("created_at"):
                    d["created_at"] = d["created_at"].isoformat()
                if d.get("updated_at"):
                    d["updated_at"] = d["updated_at"].isoformat()
                    
            record_dict = {
                "patient": patient,
                "vitals": vitals,
                "conditions": conditions,
                "medications": medications,
                "allergies": allergies,
                "procedures": procedures,
                "careplans": careplans,
                "encounters": encounters
            }
            
            await self.redis.set(cache_key, json.dumps(record_dict, default=str), ex=120)
            
            return ClinicalRecord(**record_dict)
