import { apiGet, apiPost } from '@/services/api';
import type { ComplianceDashboardData, ComplianceAudit, RiskItem, NonConformance } from '../types/compliance.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockAudits: ComplianceAudit[] = [
  { id: 'AUD-901', title: 'Annual Pharmacy Audit', auditor: 'State Inspector', startDate: t(5), endDate: t(3), status: 'Completed', department: 'Pharmacy', complianceScore: 94 },
  { id: 'AUD-902', title: 'IT Security Control Review', auditor: 'Internal Compliance', startDate: f(2), endDate: f(10), status: 'Scheduled', department: 'IT Operations' },
];

const mockRisks: RiskItem[] = [
  { id: 'RSK-01', title: 'Telemetry System Downtime', category: 'Operational', level: 'High', mitigationPlan: 'Redundant server deployment and manual monitoring drills.', owner: 'Clinical Eng Lead', lastReviewDate: t(15) },
  { id: 'RSK-02', title: 'Data Privacy Policy Breach', category: 'IT/Data', level: 'Critical', mitigationPlan: 'Zero-trust architecture implementation and quarterly audits.', owner: 'CISO', lastReviewDate: t(2) },
];

const mockNCs: NonConformance[] = [
  { id: 'NC-105', source: 'Internal Audit', description: 'Improper storage of flammable liquids in radiology.', severity: 'Medium', status: 'Mitigating', dateFound: t(8), targetResolution: f(5) },
];

const mockData: ComplianceDashboardData = {
  metrics: {
    overallRiskScore: 32,
    auditCompletionRate: 88,
    openNonConformances: 3,
    trainingCompliancePercent: 96.5,
    upcomingRegulatoryDeadlines: 2
  },
  recentAudits: mockAudits,
  criticalRisks: mockRisks,
  pendingNonConformances: mockNCs
};

export const complianceApi = {
  getDashboardData: async (): Promise<{ data: ComplianceDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: ComplianceDashboardData }>('/api/v1/compliance/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  reportNonConformance: async (nc: Partial<NonConformance>) => {
    try {
      return await apiPost('/api/v1/compliance/non-conformance', nc);
    } catch {
      return { data: { success: true }, message: 'Non-conformance reported (Mock)', status: 200 };
    }
  }
};
