import { apiGet, apiPost } from '@/services/api';
import type { ForensicDashboardData, ForensicCase, EvidenceItem, CourtSummon } from '../types/forensic.types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockCases: ForensicCase[] = [
  { id: 'FOR-2024-101', policeCaseId: 'POL-AX-882', subjectName: 'Michael Corleone', subjectAge: 34, subjectGender: 'Male', caseType: 'Physical Assault', priority: 'Urgent', status: 'Under Investigation', incidentDate: d(1), examiningOfficer: 'Dr. Sarah Connor' },
  { id: 'FOR-2024-102', policeCaseId: 'POL-BX-991', subjectName: 'Ellen Ripley', subjectAge: 42, subjectGender: 'Female', caseType: 'Toxicology', priority: 'Routine', status: 'Evidence Pending', incidentDate: d(5), examiningOfficer: 'Dr. Emmett Brown' },
  { id: 'FOR-2024-103', policeCaseId: 'POL-CX-001', subjectName: 'Unknown Subject #1', subjectGender: 'Male', caseType: 'Suspicious Death', priority: 'Immediate', status: 'Open', incidentDate: d(0), examiningOfficer: 'Dr. Hannibal Lecter' },
];

const mockEvidence: EvidenceItem[] = [
  { id: 'EVD-001', caseId: 'FOR-2024-101', type: 'DNA Swab', description: 'Left cheek mucosal swab', collectedAt: d(1), collectedBy: 'Nurse Ratched', chainOfCustody: [], secureStorageLocation: 'Vault-01' },
];

const mockSummons: CourtSummon[] = [
  { id: 'SUM-772', caseId: 'FOR-2024-055', courtName: 'Central District Court', appearanceDate: f(3), witnessRole: 'Expert Witness', status: 'Scheduled' },
];

const mockData: ForensicDashboardData = {
  metrics: {
    totalActiveCases: 42,
    pendingExamsCount: 5,
    evidenceItemsInCustody: 156,
    reportsFinalizedThisMonth: 12,
    averageTurnaroundDays: 4.5
  },
  recentCases: mockCases,
  evidenceAlerts: mockEvidence,
  upcomingCourtDates: mockSummons
};

export const forensicApi = {
  getDashboardData: async (): Promise<{ data: ForensicDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: ForensicDashboardData }>('/api/v1/forensic/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateCaseStatus: async (caseId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/forensic/cases/${caseId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Case status updated (Mock)', status: 200 };
    }
  }
};
