/**
 * MedTrustX — ANM API Client
 * Mobile-first community healthcare sync
 */
import type { ANMDashboardData } from '../types/anm.types';

const BASE_URL = '/api/v1/nursing/anm';

export interface ANMFilters {
  village?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: ANMDashboardData['kpis'] = [
  { id: '1', title: 'Pregnant Women', value: 45, status: 'normal', delta: '3 high-risk' },
  { id: '2', title: 'Children Tracked', value: 120, status: 'normal', delta: '8 vaccines due' },
  { id: '3', title: 'Pending Visits', value: 12, status: 'warning', delta: 'Due this week' },
];

const mockPatients: ANMDashboardData['patients'] = [
  { id: 'P1', name: 'Sunita Devi', type: 'pregnant_woman', village: 'Rampur', status: '3rd Trimester', priority: 'high', lastVisit: '2026-03-15' },
  { id: 'P2', name: 'Aarav Kumar', type: 'child', village: 'Rampur', status: 'Polio Vaccine Due', priority: 'high', lastVisit: '2026-02-10' },
  { id: 'P3', name: 'Geeta Rani', type: 'pregnant_woman', village: 'Shantipur', status: '1st Trimester', priority: 'normal', lastVisit: '2026-04-01' },
];

const mockRecentVisits: ANMDashboardData['recentVisits'] = [
  { id: 'V1', patientId: 'P3', patientName: 'Geeta Rani', date: '2026-04-01', type: 'anc_visit', notes: 'BP normal, iron tablets provided', synced: true },
  { id: 'V2', patientId: 'P1', patientName: 'Sunita Devi', date: '2026-04-20', type: 'anc_visit', notes: 'Patient complains of swelling', synced: false }, // Offline entry
];

const mockAlerts: ANMDashboardData['alerts'] = [
  { id: 'A1', type: 'high_risk_pregnancy', message: 'Sunita Devi (Rampur) - BP elevated during last visit. Follow-up required.', severity: 'critical', timestamp: new Date().toISOString() },
  { id: 'A2', type: 'overdue_vaccine', message: 'Aarav Kumar (Rampur) - Polio dose 3 is 2 weeks overdue.', severity: 'high', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const anmApi = {
  getDashboardSummary: async (filters: ANMFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      recentVisits: mockRecentVisits,
      alerts: mockAlerts,
    } as ANMDashboardData,
    message: 'Success', status: 200,
  }),
};
