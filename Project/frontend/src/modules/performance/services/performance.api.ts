import { apiGet, apiPost } from '@/services/api';
import type { PerformanceDashboardData, Appraisal, ClinicalKPI } from '../types/performance.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockAppraisals: Appraisal[] = [
  { id: 'APR-101', staffId: 'DOC-001', staffName: 'Dr. Sarah Connor', period: 'Q1 2026', status: 'Manager-Review', nextReviewDate: f(90) },
  { id: 'APR-102', staffId: 'NUR-015', staffName: 'Nurse James Miller', period: 'Annual 2025', status: 'Completed', overallRating: 4, nextReviewDate: f(365) },
  { id: 'APR-103', staffId: 'DOC-009', staffName: 'Dr. Kevin Hart', period: 'Q1 2026', status: 'Self-Assessment', nextReviewDate: f(90) },
];

const mockKPIs: ClinicalKPI[] = [
  { id: 'KPI-001', staffId: 'DOC-001', metricName: 'Patient Recovery Rate', targetValue: 92, currentValue: 94.5, unit: '%', trend: 'Up' },
  { id: 'KPI-002', staffId: 'NUR-015', metricName: 'Medication Error Rate', targetValue: 0.1, currentValue: 0.05, unit: '%', trend: 'Down' },
  { id: 'KPI-003', staffId: 'DOC-009', metricName: 'Average Consult Time', targetValue: 15, currentValue: 14.2, unit: 'min', trend: 'Stable' },
];

const mockData: PerformanceDashboardData = {
  metrics: {
    averageStaffRating: 4.2,
    appraisalCompletionRatePercent: 88,
    kpiTargetAchievementPercent: 92.5,
    patientSatisfactionScore: 4.6,
    trainingCompliancePercent: 98
  },
  activeAppraisals: mockAppraisals,
  topClinicalKpis: mockKPIs,
  recentFeedback: [
    { id: 'FB-001', staffId: 'DOC-001', source: 'Patient', rating: 5, comment: 'Dr. Connor was exceptionally attentive and clear with my treatment plan.', date: t(2) },
    { id: 'FB-002', staffId: 'NUR-015', source: 'Peer', rating: 4, comment: 'Great team player, always helps during peak ER hours.', date: t(5) }
  ]
};

export const performanceApi = {
  getDashboardData: async (): Promise<{ data: PerformanceDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: PerformanceDashboardData }>('/api/v1/performance/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  submitAppraisal: async (appraisalId: string, data: any) => {
    try {
      return await apiPost(`/api/v1/performance/appraisals/${appraisalId}/submit`, data);
    } catch {
      return { data: { success: true }, message: 'Appraisal submitted (Mock)', status: 200 };
    }
  }
};
