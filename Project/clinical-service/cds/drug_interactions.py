"""
Clinical Decision Support - Drug Interactions Database.
"""
from typing import List, Dict, Any

INTERACTION_DB = {
    ("warfarin", "aspirin"): {"severity": "MAJOR", "description": "Increased bleeding risk"},
    ("metformin", "contrast media"): {"severity": "MAJOR", "description": "Lactic acidosis risk"},
    ("lisinopril", "spironolactone"): {"severity": "MODERATE", "description": "Hyperkalemia risk (ACE inhibitor + Potassium-sparing diuretic)"},
    ("fluoxetine", "phenelzine"): {"severity": "CONTRAINDICATED", "description": "Serotonin syndrome risk (SSRI + MAOI)"},
    ("simvastatin", "amiodarone"): {"severity": "MAJOR", "description": "Increased risk of myopathy/rhabdomyolysis"},
    ("clopidogrel", "omeprazole"): {"severity": "MODERATE", "description": "Decreased antiplatelet effect of clopidogrel"},
    ("sildenafil", "nitroglycerin"): {"severity": "CONTRAINDICATED", "description": "Severe hypotension risk"},
    ("amoxicillin", "methotrexate"): {"severity": "MODERATE", "description": "Increased methotrexate toxicity"},
    ("ibuprofen", "lithium"): {"severity": "MAJOR", "description": "Increased lithium toxicity risk"},
    ("ciprofloxacin", "theophylline"): {"severity": "MAJOR", "description": "Increased theophylline toxicity"},
}

for i in range(1, 200):
    INTERACTION_DB[(f"drug_a_{i}", f"drug_b_{i}")] = {
        "severity": "MINOR", 
        "description": f"Minor interaction simulated {i}"
    }

class DrugInteractionChecker:
    @classmethod
    def check(cls, new_drug_name: str, active_medications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        alerts = []
        new_drug = new_drug_name.lower().strip()
        
        for med in active_medications:
            active_drug = med.get("medication_code", "").lower().strip()
            
            interaction = INTERACTION_DB.get((new_drug, active_drug))
            if interaction:
                alerts.append({
                    "interacting_drug": active_drug,
                    "severity": interaction["severity"],
                    "description": interaction["description"]
                })
            
            interaction = INTERACTION_DB.get((active_drug, new_drug))
            if interaction:
                alerts.append({
                    "interacting_drug": active_drug,
                    "severity": interaction["severity"],
                    "description": interaction["description"]
                })
                
        return alerts
