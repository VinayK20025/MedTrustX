#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:../zta-service:../iam-service:../pam-service:../medtrust-rls-lib"
pytest -v .
