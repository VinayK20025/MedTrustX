import { apiGet, apiPost } from '@/services/api';
import type { CaseDashboardData, CaseStudy, UtilizationReview } from '../types/case.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockCases: CaseStudy[] = [
  { id: 'CASE-001', patientId: 'PAT-112', patientName: 'John Silver', admissionDate: t(8), estimatedDischargeDate: f(2), status: 'Planning', barriersToDischarge: ['Home Oxygen Setup', 'Transport'], acuityLevel: 'High' },
  { id: 'CASE-002', patientId: 'PAT-443', patientName: 'Flint Captain', admissionDate: t(12), estimatedDischargeDate: f(0), status: 'Pending Approval', barriersToDischarge: ['Insurance Auth'], acuityLevel: 'Medium' },
];

const mockReviews: UtilizationReview[] = [
  { id: 'UR-101', caseId: 'CASE-001', payerName: 'BlueShield Global', status: 'Pending Review', authorizedDays: 5, nextReviewDate: f(1) },
  { id: 'UR-102', caseId: 'CASE-002', payerName: 'Medicare Platinum', status: 'Approved', authorizedDays: 14, nextReviewDate: f(3) },
];

const mockData: CaseDashboardData = {
  metrics: {
    totalActiveCases: 142,
    averageLengthOfStayDays: 6.4,
    dischargeReadyCount: 18,
    pendingUtilizationReviews: 12,
    readmissionRiskHighCount: 9
  },
  highAcuityCases: mockCases,
  pendingReviews: mockReviews,
  activeReferrals: [
    { id: 'REF-01', caseId: 'CASE-001', referralType: 'Home Health', providerName: 'VitalCare Services', status: 'Accepted', notes: 'Daily nurse visits required.' },
    { id: 'REF-02', caseId: 'CASE-002', referralType: 'Social Work', status: 'Initiated', notes: 'Assistance with SNF placement.' }
  ]
};

export const caseApi = {
  getDashboardData: async (): Promise<{ data: CaseDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: CaseDashboardData }>('/api/v1/case-management/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateDischargeStatus: async (caseId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/case-management/cases/${caseId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Status updated (Mock)', status: 200 };
    }
  }
};
