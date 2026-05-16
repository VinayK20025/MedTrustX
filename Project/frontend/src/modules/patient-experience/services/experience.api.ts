import { apiGet, apiPost } from '@/services/api';
import type { ExperienceDashboardData, PatientSurvey, Grievance } from '../types/experience.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const m = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();

const mockSurveys: PatientSurvey[] = [
  { id: 'SRV-101', patientId: 'PAT-882', patientName: 'Alice Wonderland', admissionDate: t(5), dischargeDate: t(1), score: 4.8, comments: 'The nursing staff was incredible, especially Nurse Sarah.', tags: ['Nursing', 'Professionalism'] },
  { id: 'SRV-102', patientId: 'PAT-901', patientName: 'John Doe', admissionDate: t(10), dischargeDate: t(2), score: 3.2, comments: 'Wait times for scans were longer than expected.', tags: ['Diagnostics', 'Wait Times'] },
];

const mockGrievances: Grievance[] = [
  { id: 'GRV-501', patientId: 'PAT-771', patientName: 'Marcus Aurelius', category: 'Staff Behavior', priority: 'High', status: 'Investigating', description: 'Rude behavior from front desk during check-in.', receivedDate: t(1) },
  { id: 'GRV-502', patientId: 'PAT-662', patientName: 'Seneca Younger', category: 'Billing', priority: 'Medium', status: 'Assigned', description: 'Incorrect charge for private room.', receivedDate: t(3) },
];

const mockData: ExperienceDashboardData = {
  metrics: {
    averageNpsScore: 74,
    surveyCompletionRatePercent: 62,
    activeGrievancesCount: 8,
    averageResolutionTimeHours: 28,
    sentimentScorePercent: 86
  },
  recentSurveys: mockSurveys,
  activeGrievances: mockGrievances,
  pendingRequests: [
    { id: 'REQ-01', patientId: 'PAT-112', roomNumber: '402-A', requestType: 'Meal', status: 'Pending', requestTime: m(15) },
    { id: 'REQ-02', patientId: 'PAT-443', roomNumber: '310-B', requestType: 'Advocacy', status: 'In Progress', requestTime: m(45) }
  ]
};

export const experienceApi = {
  getDashboardData: async (): Promise<{ data: ExperienceDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: ExperienceDashboardData }>('/api/v1/patient-experience/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateGrievance: async (grievanceId: string, updates: Partial<Grievance>) => {
    try {
      return await apiPost(`/api/v1/patient-experience/grievances/${grievanceId}`, updates);
    } catch {
      return { data: { success: true }, message: 'Grievance updated (Mock)', status: 200 };
    }
  }
};
