import type { AiEthicsData } from '../types/ai-ethics.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: AiEthicsData = {
  metrics: {
    totalModelsMonitored: 24,
    biasAlertsActive: 2,
    complianceScore: 96,
    highRiskModels: 3,
    explainabilityCoverage: 85,
  },
  models: [
    { id: 'MOD-DX', name: 'Clinical Diagnosis Assistant', department: 'Internal Medicine', clinicalUse: 'Triage & Differential Dx', riskLevel: 'High', reviewStatus: 'Review Required', lastAudited: t(-86400 * 5), humanInTheLoop: true },
    { id: 'MOD-RD', name: 'Readmission Predictor', department: 'Discharge Planning', clinicalUse: 'Risk Stratification', riskLevel: 'Medium', reviewStatus: 'Approved', lastAudited: t(-86400 * 15), humanInTheLoop: false },
    { id: 'MOD-ICU', name: 'Sepsis Early Warning', department: 'ICU', clinicalUse: 'Vitals Monitoring', riskLevel: 'High', reviewStatus: 'Approved', lastAudited: t(-86400 * 2), humanInTheLoop: true },
    { id: 'MOD-SCH', name: 'Smart Scheduling', department: 'Operations', clinicalUse: 'Appointment Optimization', riskLevel: 'Low', reviewStatus: 'Approved', lastAudited: t(-86400 * 60), humanInTheLoop: false },
    { id: 'MOD-TR', name: 'Dermatology Image Triage', department: 'Dermatology', clinicalUse: 'Lesion Classification', riskLevel: 'High', reviewStatus: 'Blocked', lastAudited: t(-3600 * 12), humanInTheLoop: true },
  ],
  biasMetrics: {
    'MOD-DX': [
      { category: 'Gender', metricName: 'Disparate Impact', score: 0.92, threshold: 0.8, status: 'Pass' },
      { category: 'Ethnicity', metricName: 'Equal Opportunity Difference', score: 0.74, threshold: 0.8, status: 'Fail' },
      { category: 'Age', metricName: 'Statistical Parity Difference', score: 0.81, threshold: 0.8, status: 'Warning' },
    ],
    'MOD-TR': [
      { category: 'Ethnicity', metricName: 'False Negative Rate Disparity', score: 0.65, threshold: 0.8, status: 'Fail' },
      { category: 'Gender', metricName: 'Disparate Impact', score: 0.88, threshold: 0.8, status: 'Pass' },
    ]
  },
  explainabilityData: {
    'MOD-DX': [
      { feature: 'Patient Age', impact: 'High', shapValue: 0.45, isClinicallyValid: true },
      { feature: 'HbA1c Level', impact: 'High', shapValue: 0.38, isClinicallyValid: true },
      { feature: 'Zip Code', impact: 'Medium', shapValue: 0.15, isClinicallyValid: false }, // Ethical concern
      { feature: 'Prior Admissions', impact: 'Low', shapValue: 0.05, isClinicallyValid: true },
    ]
  },
  risks: [
    { riskType: 'Automation Bias', description: 'Clinicians over-relying on Sepsis Early Warning without verifying labs.', severity: 'High', mitigationStrategy: 'Enforce mandatory "Reason for Dismissal" UI block.', status: 'Active' },
    { riskType: 'Misdiagnosis', description: 'Dermatology Triage under-performing on darker skin tones.', severity: 'High', mitigationStrategy: 'Model Blocked. Retraining on diverse dataset mandated.', status: 'Mitigated' },
    { riskType: 'Data Drift', description: 'Readmission Predictor accuracy drifting post-COVID protocols.', severity: 'Medium', mitigationStrategy: 'Scheduled for retraining next sprint.', status: 'Investigating' },
  ],
  compliance: [
    { standard: 'GDPR Article 22', description: 'Right not to be subject to solely automated decision-making', status: 'Compliant', lastChecked: t(-86400 * 2) },
    { standard: 'HIPAA Safe Harbor', description: 'De-identification of training data pipelines', status: 'Compliant', lastChecked: t(-86400 * 10) },
    { standard: 'EU AI Act (Draft)', description: 'High-risk AI system transparency requirements', status: 'Pending Review', lastChecked: t(-86400 * 1) },
  ],
  alerts: [
    { id: 'ALT-1', title: 'Bias Threshold Breached', description: 'Dermatology Triage model failed False Negative Rate parity for ethnicity group. Deployment blocked.', severity: 'Critical', timestamp: t(-7200), modelId: 'MOD-TR', actionRequired: true },
    { id: 'ALT-2', title: 'Non-Clinical Feature Detected', description: 'Clinical Diagnosis Assistant is using "Zip Code" as a medium-impact predictive feature. Review required.', severity: 'Warning', timestamp: t(-14400), modelId: 'MOD-DX', actionRequired: true },
  ],
};

export const aiEthicsApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  blockModel: async (id: string) => ({ data: { success: true }, message: 'Model blocked from deployment', status: 200 }),
  approveModel: async (id: string) => ({ data: { success: true }, message: 'Model approved for clinical use', status: 200 }),
  dismissAlert: async (id: string) => ({ data: { success: true }, message: 'Alert dismissed', status: 200 }),
};
