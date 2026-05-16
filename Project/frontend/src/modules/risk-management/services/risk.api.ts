import { apiGet, apiPost } from '@/services/api';
import type { RiskDashboardData, RiskEntry, MitigationPlan } from '../types/risk.types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockRisks: RiskEntry[] = [
  { id: 'RSK-001', category: 'Clinical', level: 'Extreme', status: 'Mitigating', title: 'Critical Staffing Shortage in ER', description: 'Reduced nurse-to-patient ratio increasing potential for clinical errors.', inherentScore: 25, residualScore: 12, owner: 'Dr. Alan Grant' },
  { id: 'RSK-002', category: 'Financial', level: 'High', status: 'Assessed', title: 'Rising Medical Supply Inflation', description: 'Increased costs of specialized implants and consumables impacting margins.', inherentScore: 16, residualScore: 16, owner: 'CFO Office' },
  { id: 'RSK-003', category: 'Compliance', level: 'Medium', status: 'Mitigating', title: 'GDPR Data Residency Updates', description: 'Ensuring new cloud regional nodes comply with evolving data laws.', inherentScore: 12, residualScore: 4, owner: 'DPO Sarah' },
];

const mockMitigations: MitigationPlan[] = [
  { id: 'MIT-401', riskId: 'RSK-001', strategy: 'Mitigate', budgetAllocated: 500000, actions: [{ description: 'Hire 15 contract nurses', status: 'Open', dueDate: f(14) }, { description: 'Implement dynamic shift incentives', status: 'Completed', dueDate: d(5) }] },
];

const mockData: RiskDashboardData = {
  metrics: {
    totalRisksInRegister: 84,
    extremeRisksCount: 3,
    overdueMitigationActions: 14,
    averageRiskReductionPercent: 62.4,
    insuranceCoverageAdequacyPercent: 98.5
  },
  topRisks: mockRisks,
  pendingAssessments: mockRisks.slice(1, 2),
  mitigationOverview: mockMitigations
};

export const riskApi = {
  getDashboardData: async (): Promise<{ data: RiskDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: RiskDashboardData }>('/api/v1/risk-mgmt/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateRiskStatus: async (riskId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/risk-mgmt/risks/${riskId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Risk status updated (Mock)', status: 200 };
    }
  }
};
