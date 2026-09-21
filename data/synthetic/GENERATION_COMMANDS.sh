#!/usr/bin/env bash
set -euo pipefail

# Official Synthea source:
# https://github.com/synthetichealth/synthea

git clone https://github.com/synthetichealth/synthea.git
cd synthea
./gradlew build
./run_synthea -p 1000 --exporter.csv.export=true

# Copy the four MedTrustX source CSVs into the expected location.
mkdir -p "$HOME/MedTrustX/output/csv"
cp output/csv/patients.csv "$HOME/MedTrustX/output/csv/"
cp output/csv/observations.csv "$HOME/MedTrustX/output/csv/"
cp output/csv/conditions.csv "$HOME/MedTrustX/output/csv/"
cp output/csv/encounters.csv "$HOME/MedTrustX/output/csv/"
