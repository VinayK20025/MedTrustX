import { apiGet, apiPost } from '@/services/api';
import type { GovernanceDashboardData, DataPolicy, PrivacyRequest } from '../types/governance.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockPolicies: DataPolicy[] = [
  { id: 'POL-101', title: 'Clinical Data Retention Policy', category: 'Retention', classification: 'Restricted (PHI)', status: 'Active', owner: 'Chief Privacy Officer', lastReviewed: t(100), nextReview: f(265) },
  { id: 'POL-102', title: 'Remote Access for Researchers', category: 'Access', classification: 'Confidential', status: 'Under Review', owner: 'Research Director', lastReviewed: t(10), nextReview: f(50) },
  { id: 'POL-103', title: 'AI Model Training Data Ethics', category: 'Privacy', classification: 'Internal', status: 'Active', owner: 'Data Governance Lead', lastReviewed: t(30), nextReview: f(335) },
];

const mockRequests: PrivacyRequest[] = [
  { id: 'PRV-501', patientId: 'PAT-902', type: 'Data Access', requestDate: t(2), status: 'Processing', dueDate: f(28) },
  { id: 'PRV-502', patientId: 'PAT-112', type: 'Consent Revocation', requestDate: t(5), status: 'Pending', dueDate: f(25) },
];

const mockData: GovernanceDashboardData = {
  metrics: {
    totalDataAssets: 1450,
    phiComplianceScore: 98.4,
    privacyRequestsPending: 8,
    dataQualityAverage: 91.2,
    unclassifiedAssetsCount: 42
  },
  topPolicies: mockPolicies,
  recentPrivacyRequests: mockRequests,
  dataQualityTrends: [
    { date: t(30), score: 88 },
    { date: t(20), score: 89.5 },
    { date: t(10), score: 90.8 },
    { date: t(0), score: 91.2 },
  ]
};

export const governanceApi = {
  getDashboardData: async (): Promise<{ data: GovernanceDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: GovernanceDashboardData }>('/api/v1/governance/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updatePolicyStatus: async (policyId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/governance/policies/${policyId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Policy updated (Mock)', status: 200 };
    }
  }
};
