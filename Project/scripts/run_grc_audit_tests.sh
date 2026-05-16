#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " MEDTRUSTX GRC & AUDIT INFRASTRUCTURE TEST SUITE "
echo "=========================================================="

cd "$(dirname "$0")/.."

echo ">>> Installing test dependencies..."
pip install -r tests/requirements.txt -q
pip uninstall -y web3 eth-typing

echo ">>> Running Audit Service Tests..."
PYTHONPATH=$(pwd)/audit-service pytest tests/test_audit_engine.py tests/test_hash_chain_integrity.py tests/test_breach_detection.py -v

echo ">>> Running Compliance Service Tests..."
PYTHONPATH=$(pwd)/compliance-service pytest tests/test_compliance_engine.py tests/test_framework_mapping.py tests/test_risk_register.py -v

echo ">>> Running Consent Service Tests..."
PYTHONPATH=$(pwd)/consent-service pytest tests/test_consent_lifecycle.py tests/test_smart_contract_anchoring.py tests/test_policy_engine.py -v

echo "=========================================================="
echo " ALL GRC & AUDIT TESTS PASSED SUCCESSFULLY! "
echo "=========================================================="
