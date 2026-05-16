"""
Clinical Decision Support - Allergy Checker.
"""
from typing import List, Dict, Any

CROSS_REACTIVITY = {
    "penicillin": ["amoxicillin", "ampicillin", "piperacillin", "cephalexin", "cefazolin", "ceftriaxone", "cefepime"],
    "sulfa": ["sulfamethoxazole", "furosemide", "hydrochlorothiazide", "celecoxib", "glipizide"],
    "nsaid": ["ibuprofen", "naproxen", "diclofenac", "ketorolac", "meloxicam", "aspirin", "celecoxib"]
}

class AllergyChecker:
    @classmethod
    def check(cls, medication_name: str, patient_allergies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        alerts = []
        med_lower = medication_name.lower().strip()
        
        for allergy in patient_allergies:
            allergen = allergy.get("allergen", "").lower().strip()
            
            if allergen == med_lower:
                alerts.append({
                    "severity": "CONTRAINDICATED",
                    "description": f"Patient has documented allergy to {medication_name}",
                    "recommendation": "Do not prescribe. Select alternative therapy."
                })
                continue
                
            if allergen in CROSS_REACTIVITY:
                if med_lower in CROSS_REACTIVITY[allergen]:
                    if allergen == "penicillin" and med_lower.startswith("cef"):
                        alerts.append({
                            "severity": "WARNING",
                            "description": f"Potential cross-reactivity: {medication_name} in patient with {allergen} allergy (~10% risk)",
                            "recommendation": "Use with caution or select alternative."
                        })
                    else:
                        alerts.append({
                            "severity": "CONTRAINDICATED",
                            "description": f"Patient has documented allergy to {allergen} class which includes {medication_name}",
                            "recommendation": "Do not prescribe. Select alternative therapy."
                        })
                        
        return alerts
