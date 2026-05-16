import { apiGet, apiPost } from '@/services/api';
import type { EthicsDashboardData, EthicsConsultation } from '../types/ethics.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockConsultations: EthicsConsultation[] = [
  { id: 'ETH-001', patientId: 'PAT-882', patientName: 'John Doe', department: 'ICU', requestor: 'Dr. Marcus Webb', reason: 'End-of-life decision-making conflict.', status: 'Active', dateRequested: t(1), priority: 'Urgent' },
  { id: 'ETH-002', patientId: 'PAT-115', patientName: 'Baby Jane', department: 'NICU', requestor: 'Nurse Sarah', reason: 'Parental refusal of life-saving treatment.', status: 'Deliberating', dateRequested: t(3), priority: 'Urgent' },
  { id: 'ETH-003', patientId: 'PAT-450', patientName: 'Robert Smith', department: 'Neurology', requestor: 'Dr. Elena Rostova', reason: 'Competency review for surgery consent.', status: 'New', dateRequested: t(0), priority: 'Routine' },
];

const mockData: EthicsDashboardData = {
  metrics: {
    activeConsultations: 3,
    averageResponseTimeHours: 4.5,
    committeeMeetingAttendancePercent: 92,
    coiComplianceRatePercent: 98.5
  },
  consultations: mockConsultations,
  upcomingMeetings: [
    { date: f(2), agenda: 'Review of NICU Case ETH-002', location: 'Board Room / Zoom' },
    { date: f(7), agenda: 'Monthly Policy Review - AI Ethics', location: 'Conference Hall B' }
  ],
  coiAlerts: [
    { staffName: 'Dr. Kevin Zhang', issue: 'Potential financial COI with pharma vendor.', date: t(2) }
  ]
};

export const ethicsApi = {
  getDashboardData: async (): Promise<{ data: EthicsDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: EthicsDashboardData }>('/api/v1/ethics/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  submitConsultation: async (consultation: Partial<EthicsConsultation>) => {
    try {
      return await apiPost('/api/v1/ethics/consultations', consultation);
    } catch {
      return { data: { success: true }, message: 'Consultation requested (Mock)', status: 200 };
    }
  }
};
