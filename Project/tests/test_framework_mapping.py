"""
Tests for Framework Mapping.
"""
import pytest

from app.services.control_mapper import FRAMEWORKS

def test_frameworks_registered():
    assert "HIPAA" in FRAMEWORKS
    assert "GDPR" in FRAMEWORKS
    assert "DPDP" in FRAMEWORKS
    assert "ISO 27001:2022" in FRAMEWORKS
    assert "ISO 42001:2023" in FRAMEWORKS
    
def test_framework_controls_structure():
    hipaa_controls = FRAMEWORKS["HIPAA"]
    assert len(hipaa_controls) > 0
    assert hipaa_controls[0].control_id is not None
