import type { AiGovernanceData } from '../types/ai-governance.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: AiGovernanceData = {
  metrics: {
    totalModels: 34,
    pendingApprovals: 4,
    complianceScore: 93,
    biasIncidents: 1,
    openRisks: 3,
  },
  models: [
    { id: 'MOD-091', name: 'Sepsis Risk Predictor', version: 'v2.4', department: 'ICU', status: 'Active', approvalDate: t(-86400 * 30), riskSeverity: 'High', biasScore: 0.94, accuracy: 96.2 },
    { id: 'MOD-042', name: 'Imaging Triage Assistant', version: 'v1.2', department: 'Radiology', status: 'Pending Approval', riskSeverity: 'High', biasScore: 0.88, accuracy: 94.1 },
    { id: 'MOD-015', name: 'No-Show Predictor', version: 'v3.0', department: 'Operations', status: 'Active', approvalDate: t(-86400 * 120), riskSeverity: 'Low', biasScore: 0.98, accuracy: 89.5 },
    { id: 'MOD-077', name: 'Automated Billing Coder', version: 'v1.0', department: 'Finance', status: 'Under Review', riskSeverity: 'Medium', biasScore: 0.82, accuracy: 91.4 },
    { id: 'MOD-088', name: 'Readmission Risk', version: 'v2.1', department: 'Discharge', status: 'Rejected', riskSeverity: 'High', biasScore: 0.65, accuracy: 85.0 },
  ],
  biasMetrics: {
    'MOD-091': [
      { demographic: 'Age > 65', metric: 'False Positive Rate Disparity', disparity: 0.04, status: 'Clear' },
      { demographic: 'Gender', metric: 'Disparate Impact', disparity: 0.02, status: 'Clear' },
    ],
    'MOD-088': [
      { demographic: 'Socioeconomic Status', metric: 'Equal Opportunity Difference', disparity: 0.25, status: 'Detected' },
      { demographic: 'Ethnicity', metric: 'False Negative Rate Disparity', disparity: 0.18, status: 'Warning' },
    ],
    'MOD-042': [
      { demographic: 'Age < 18', metric: 'Accuracy Disparity', disparity: 0.12, status: 'Warning' },
    ],
  },
  regulations: [
    { id: 'REG-GDPR', name: 'GDPR Article 22 (Automated Processing)', status: 'Compliant', lastAuditDate: t(-86400 * 5), issuesCount: 0 },
    { id: 'REG-EUAI', name: 'EU AI Act (High-Risk Systems)', status: 'At Risk', lastAuditDate: t(-86400 * 2), issuesCount: 2 },
    { id: 'REG-HIPAA', name: 'HIPAA De-identification Standard', status: 'Compliant', lastAuditDate: t(-86400 * 15), issuesCount: 0 },
    { id: 'REG-FDA', name: 'FDA SaMD Regulations', status: 'Non-Compliant', lastAuditDate: t(-86400 * 1), issuesCount: 1 },
  ],
  risks: [
    { id: 'RSK-101', riskName: 'Data Drift Degradation', severity: 'High', status: 'Open', affectedModelId: 'MOD-091', description: 'Recent post-COVID data streams show significant drift, potentially lowering sepsis model accuracy.' },
    { id: 'RSK-102', riskName: 'Socioeconomic Bias', severity: 'High', status: 'Mitigating', affectedModelId: 'MOD-088', description: 'Model rejected due to significant socioeconomic bias in readmission scoring.' },
    { id: 'RSK-103', riskName: 'Explainability Gap', severity: 'Medium', status: 'Open', affectedModelId: 'MOD-077', description: 'Billing coder lacks sufficient SHAP values to explain rejected claims.' },
  ],
  auditLogs: [
    { id: 'LOG-991', timestamp: t(-3600), action: 'Model Rejected - Bias Threshold Exceeded', user: 'Gov Officer A.', modelId: 'MOD-088', status: 'Success' },
    { id: 'LOG-992', timestamp: t(-7200), action: 'FDA Compliance Audit Initiated', user: 'Compliance System', modelId: 'MOD-042', status: 'Warning' },
    { id: 'LOG-993', timestamp: t(-86400 * 2), action: 'Annual GDPR Recertification', user: 'Gov Officer A.', modelId: 'MOD-091', status: 'Success' },
    { id: 'LOG-994', timestamp: t(-86400 * 5), action: 'Model Promoted to Staging', user: 'ML Eng Lead', modelId: 'MOD-077', status: 'Success' },
  ],
};

export const aiGovernanceApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  approveModel: async (id: string) => ({ data: { success: true }, message: 'Model Approved', status: 200 }),
  rejectModel: async (id: string) => ({ data: { success: true }, message: 'Model Rejected', status: 200 }),
  initiateAudit: async (id: string) => ({ data: { success: true }, message: 'Audit Initiated', status: 200 }),
};
