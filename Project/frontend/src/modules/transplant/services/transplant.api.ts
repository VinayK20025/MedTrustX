import { apiGet, apiPost } from '@/services/api';
import type { TransplantDashboardData, TransplantRecipient, OrganDonor, TransplantMatch } from '../types/transplant.types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockRecipients: TransplantRecipient[] = [
  { id: 'REC-001', patientId: 'PAT-442', name: 'James Wilson', organNeeded: 'Kidney', bloodType: 'O+', hlaTyping: 'A2, B8, DR17', priority: 'Critical', waitlistEntryDate: d(450), status: 'Matching', matchingScore: 92 },
  { id: 'REC-002', patientId: 'PAT-129', name: 'Maria Garcia', organNeeded: 'Liver', bloodType: 'A-', hlaTyping: 'A1, B7, DR15', priority: 'Urgent', waitlistEntryDate: d(120), status: 'Waitlisted' },
  { id: 'REC-003', patientId: 'PAT-881', name: 'Robert Taylor', organNeeded: 'Heart', bloodType: 'B+', hlaTyping: 'A3, B44, DR4', priority: 'Critical', waitlistEntryDate: d(60), status: 'Matching', matchingScore: 88 },
];

const mockDonors: OrganDonor[] = [
  { id: 'DON-991', type: 'Deceased', organType: 'Kidney', bloodType: 'O+', hlaTyping: 'A2, B8, DR17', status: 'Available', location: 'Regional Organ Bank' },
  { id: 'DON-992', type: 'Living', organType: 'Liver', bloodType: 'A-', hlaTyping: 'A1, B7, DR15', status: 'Reserved', location: 'Surgery Ward B' },
];

const mockMatches: TransplantMatch[] = [
  { id: 'MCH-552', recipientId: 'REC-001', donorId: 'DON-991', matchScore: 98.4, compatibilityDetails: 'Full HLA match across 6 loci', status: 'Confirmed' },
];

const mockData: TransplantDashboardData = {
  metrics: {
    totalWaitlisted: 142,
    activeMatches: 8,
    completedTransplantsYTD: 24,
    averageWaitTimeDays: 312,
    organSurvivalRatePercent: 94.2
  },
  topWaitlist: mockRecipients,
  recentMatches: mockMatches,
  availableOrgans: mockDonors
};

export const transplantApi = {
  getDashboardData: async (): Promise<{ data: TransplantDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: TransplantDashboardData }>('/api/v1/transplant/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  proposeMatch: async (recipientId: string, donorId: string) => {
    try {
      return await apiPost('/api/v1/transplant/propose-match', { recipientId, donorId });
    } catch {
      return { data: { success: true }, message: 'Match proposed (Mock)', status: 200 };
    }
  }
};
