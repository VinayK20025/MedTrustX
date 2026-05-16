# GraphQL Federation

The GraphQL Gateway acts as the single entry point for MedTrustX dashboards.
It delegates to the `api-composition-gateway` which handles parallel REST aggregation.

### Key Queries:
- `patient_dashboard(patient_id)`: Fetches demographics, vitals, conditions, meds, risk.
- `clinical_summary(patient_id)`: Fetches vitals, conditions, orders, results, AI insights.
- `admin_overview(tenant_id)`: Fetches IAM stats, compliance scores, threat active count.
