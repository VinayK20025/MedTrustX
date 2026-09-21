# MedTrustX Synthetic Synthea Dataset

This directory documents the reproducible source and generation workflow for the synthetic clinical dataset used by MedTrustX.

## Source
- Generator: Synthea Patient Generator
- Official repository: https://github.com/synthetichealth/synthea
- Source repository default branch at the time of documentation: `master`

Synthea generates synthetic, realistic-but-not-real patient records. MedTrustX should not describe these records as real patient data.

## Reproducible generation

From a local checkout of the official Synthea repository:

```bash
git clone https://github.com/synthetichealth/synthea.git
cd synthea
./gradlew build
./run_synthea -p 1000 --exporter.csv.export=true
```

The CSV exporter writes the generated CSV files beneath the configured Synthea output directory (by default `./output/`).

## MedTrustX input files

The current MedTrustX seed scripts expect:

```
~/MedTrustX/output/csv/patients.csv
~/MedTrustX/output/csv/observations.csv
~/MedTrustX/output/csv/conditions.csv
~/MedTrustX/output/csv/encounters.csv
```

## Cohort assignment used by MedTrustX

The patient seeding script assigns the first 700 rows of `patients.csv` to `tenant_general` and the remaining rows to `tenant_outpatient`. This is an application-specific partition and is not a Synthea property.

## Readmission-risk label

MedTrustX derives a synthetic risk score from the generated cohort using the formula implemented in `seed_ai_engine.py`:

```score_raw = 0.4 * number_of_conditions + 0.1 * number_of_encounters + 0.005 * clipped_age
```

The score is then normalized by the cohort maximum and binned into low/medium/high categories. This is a model-derived synthetic label, not an observed or clinically validated readmission outcome.

## Publication note

For a journal submission, cite Synthea as the synthetic data generator and clearly distinguish (1) Synthea-generated records from (2) MedTrustX-derived analytics labels and application metadata. Do not imply that the synthetic risk label represents observed hospital readmissions.
