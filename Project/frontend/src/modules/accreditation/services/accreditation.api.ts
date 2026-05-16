import { apiGet, apiPost } from '@/services/api';
import type { AccreditationDashboardData, AccreditationStandard, AccreditationSurvey } from '../types/accreditation.types';

const t = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockStandards: AccreditationStandard[] = [
  { id: 'STD-101', chapter: 'Patient Care', code: 'PCC.1.1', statement: 'Patients are informed of their rights and responsibilities.', status: 'Compliant', lastAssessmentDate: t(-15), assessor: 'Admin Officer', evidenceCount: 4 },
  { id: 'STD-102', chapter: 'Infection Control', code: 'IC.3.0', statement: 'Hospital maintains an active surveillance program for infections.', status: 'Partial', lastAssessmentDate: t(-2), assessor: 'Quality Head', evidenceCount: 2 },
  { id: 'STD-103', chapter: 'Facility Management', code: 'FMS.4.2', statement: 'Fire safety systems are tested and maintained regularly.', status: 'Compliant', lastAssessmentDate: t(-30), assessor: 'Safety Engineer', evidenceCount: 12 },
];

const mockSurveys: AccreditationSurvey[] = [
  { id: 'SUR-01', title: 'JCI Mock Survey', body: 'JCI', startDate: t(10), endDate: t(14), type: 'Mock', status: 'Scheduled' },
  { id: 'SUR-02', title: 'State Licensing Audit', body: 'Department of Health', startDate: t(-20), endDate: t(-18), type: 'Official', status: 'Completed' },
];

const mockData: AccreditationDashboardData = {
  metrics: {
    overallCompliancePercent: 88.5,
    standardsVerified: 142,
    totalStandards: 160,
    pendingEvidence: 12,
    daysToNextSurvey: 10
  },
  chapters: [
    { name: 'Access to Care', compliance: 95, standardsCount: 20 },
    { name: 'Patient Rights', compliance: 100, standardsCount: 15 },
    { name: 'Quality Improvement', compliance: 82, standardsCount: 25 },
    { name: 'Facility Safety', compliance: 78, standardsCount: 30 },
  ],
  recentStandards: mockStandards,
  upcomingSurveys: mockSurveys
};

export const accreditationApi = {
  getDashboardData: async (): Promise<{ data: AccreditationDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: AccreditationDashboardData }>('/api/v1/accreditation/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateStandardStatus: async (standardId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/accreditation/standards/${standardId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Status updated (Mock)', status: 200 };
    }
  }
};
