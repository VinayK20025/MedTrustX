# MedTrustX Clinical Architecture

This module implements the clinical workflows for MedTrustX DHOS.

## Services
1. **Patient Service**: Patient CRUD, Demographics, FHIR R4.
2. **Clinical Service**: Vitals, Conditions, Medications, Orders, Results, Care Plans, Referrals, CDS Engine.
3. **Appointment Service**: Scheduling, Conflicts, Waitlist.

## Key Features
- **PQC-Hybrid JWT**: Post-Quantum Cryptography auth.
- **Z-Score Anomaly Detection**: In `VitalsProcessor`.
- **CDS Hook Support**: Drug interactions, allergy cross-reactivity, dosage validation.
- **FHIR R4 Mapping**: Strict adherence to HL7 standards.
- **Zero Trust (RLS)**: Row-Level Security isolation across PostgreSQL databases.
