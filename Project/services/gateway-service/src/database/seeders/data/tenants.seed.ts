export const TENANTS_SEED = [
  {
    name: 'MedTrustX General Hospital',
    slug: 'medtrust-general',
    type: 'hospital',
    subscription_plan: 'enterprise',
    features_enabled: ['icu_module', 'telemedicine', 'iomt_integration', 'agentic_trust'],
    is_active: true,
  },
  {
    name: 'CityCare Outpatient Clinic',
    slug: 'citycare-opd',
    type: 'clinic',
    subscription_plan: 'standard',
    features_enabled: ['telemedicine', 'billing_basic'],
    is_active: true,
  },
];
