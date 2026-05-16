"""
Clinical Decision Support - Dosage Validator.
"""
from typing import Dict, Any, List

DOSING_RULES = {
    "acetaminophen": {
        "max_dose_mg_per_kg": 15,
        "max_daily_dose_mg": 4000
    },
    "ibuprofen": {
        "max_dose_mg_per_kg": 10,
        "max_daily_dose_mg": 3200
    },
    "amoxicillin": {
        "pediatric_max_dose_mg_per_kg": 90,
        "adult_standard_dose_mg": 500
    }
}

class DosageValidator:
    @classmethod
    def validate(cls, medication_name: str, dose_mg: float, patient_weight_kg: float, patient_age_years: int) -> Dict[str, Any]:
        med_lower = medication_name.lower().strip()
        rule = DOSING_RULES.get(med_lower)
        
        if not rule:
            return {"is_valid": True, "alerts": []}
            
        alerts = []
        
        if "max_dose_mg_per_kg" in rule and patient_weight_kg > 0:
            max_dose = rule["max_dose_mg_per_kg"] * patient_weight_kg
            if dose_mg > max_dose:
                alerts.append({
                    "severity": "WARNING",
                    "description": f"Dose {dose_mg}mg exceeds recommended weight-based maximum ({max_dose}mg)",
                    "recommendation": f"Reduce dose to <= {max_dose}mg"
                })
                
        if patient_age_years < 18 and "pediatric_max_dose_mg_per_kg" in rule and patient_weight_kg > 0:
            max_dose = rule["pediatric_max_dose_mg_per_kg"] * patient_weight_kg
            if dose_mg > max_dose:
                alerts.append({
                    "severity": "WARNING",
                    "description": f"Pediatric dose {dose_mg}mg exceeds recommended weight-based maximum ({max_dose}mg)",
                    "recommendation": f"Reduce dose to <= {max_dose}mg"
                })
                
        if "max_daily_dose_mg" in rule:
            if dose_mg > rule["max_daily_dose_mg"]:
                alerts.append({
                    "severity": "CONTRAINDICATED",
                    "description": f"Single dose {dose_mg}mg exceeds daily maximum ({rule['max_daily_dose_mg']}mg)",
                    "recommendation": "Do not prescribe. Fatal toxicity risk."
                })
                
        return {
            "is_valid": len([a for a in alerts if a["severity"] == "CONTRAINDICATED"]) == 0,
            "alerts": alerts
        }
