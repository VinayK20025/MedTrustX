import pytest
from cds.drug_interactions import DrugInteractionChecker
from cds.allergy_checker import AllergyChecker
from cds.dosage_validator import DosageValidator

def test_drug_interaction_checker():
    active_meds = [{"medication_code": "aspirin"}]
    alerts = DrugInteractionChecker.check("warfarin", active_meds)
    
    assert len(alerts) > 0
    assert alerts[0]["severity"] == "MAJOR"
    assert "bleeding risk" in alerts[0]["description"].lower()

def test_allergy_checker():
    allergies = [{"allergen": "penicillin", "severity": "severe"}]
    
    alerts1 = AllergyChecker.check("penicillin", allergies)
    assert alerts1[0]["severity"] == "CONTRAINDICATED"
    
    alerts2 = AllergyChecker.check("cephalexin", allergies)
    assert alerts2[0]["severity"] == "CONTRAINDICATED"
    assert "class which includes" in alerts2[0]["description"].lower()

def test_dosage_validator():
    res1 = DosageValidator.validate("acetaminophen", 5000, 70, 30)
    assert not res1["is_valid"]
    assert res1["alerts"][0]["severity"] == "WARNING"
    
    res2 = DosageValidator.validate("acetaminophen", 1000, 70, 30)
    assert res2["is_valid"]
