import type { LegalRiskData } from '../types/legal-risk.types';

export interface RiskFilters { category?: string; severity?: string; }

const mockData: LegalRiskData = {
  kpis: [
    { id: '1', label: 'Active Risks', value: 14, trend: 'up', status: 'warning' },
    { id: '2', label: 'High Exposure Risks', value: 3, trend: 'flat', status: 'critical' },
    { id: '3', label: 'Mitigation Rate', value: '88%', trend: 'up', status: 'success' },
    { id: '4', label: 'Prevented Litigation', value: 6, trend: 'up', status: 'success' },
  ],
  risks: [
    { id: 'RSK-201', title: 'Missing Surgical Consents in Night Shift', category: 'Documentation', probability: 'High', impact: 'High', severity: 'Critical', status: 'Assessing', source: 'Internal Audit', department: 'Surgery', identifiedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'RSK-202', title: 'Expired Radiation Badge Approvals', category: 'Compliance', probability: 'High', impact: 'Medium', severity: 'High', status: 'Mitigating', source: 'License Tracker', department: 'Radiology', identifiedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'RSK-203', title: 'Vendor API Data Privacy Vulnerability', category: 'Operational', probability: 'Low', impact: 'High', severity: 'High', status: 'Identified', source: 'IT Security Report', department: 'IT', identifiedAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'RSK-204', title: 'Nurse Union Overtime Dispute', category: 'Contractual', probability: 'Medium', impact: 'Medium', severity: 'Medium', status: 'Monitoring', source: 'HR Feedback', department: 'HR', identifiedAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  ],
  mitigations: [
    { id: 'MIT-1', riskId: 'RSK-201', action: 'Implement digital mandatory consent checklist block in EHR before OT scheduling.', owner: 'Dr. Sarah (Chief Medical Officer)', status: 'In Progress', dueDate: new Date(Date.now() + 86400000 * 5).toISOString() },
    { id: 'MIT-2', riskId: 'RSK-202', action: 'Expedite AERB renewal packet submission.', owner: 'Legal Compliance Officer', status: 'Completed', dueDate: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
  incidents: [
    { id: 'INC-702', riskId: 'RSK-201', type: 'Near Miss - Missing Consent', date: new Date(Date.now() - 86400000 * 4).toISOString(), status: 'Closed' },
  ]
};

export const legalRiskApi = {
  getDashboardSummary: async (f: RiskFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateRiskStatus: async (riskId: string, status: string) => ({ data: { success: true }, message: 'Risk status updated', status: 200 }),
  addMitigationAction: async (riskId: string, payload: any) => ({ data: { success: true }, message: 'Mitigation action added', status: 200 }),
  updateMitigationStatus: async (mitId: string, status: string) => ({ data: { success: true }, message: 'Mitigation step updated', status: 200 }),
};
