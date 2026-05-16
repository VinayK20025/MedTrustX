/**
 * MedTrustX — Visiting Intensivist API Client
 * High-signal data layer for ICU consults
 */
import type { IntensivistDashboardData } from '../types/intensivist.types';

const BASE_URL = '/api/v1/clinical/intensivist';

export interface IntensivistFilters {
  unit?: 'all' | 'neuro_icu' | 'cardiac_icu' | 'nicu';
  status?: 'all' | 'pending';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: IntensivistDashboardData['kpis'] = [
  { id: '1', title: 'Pending Reviews', value: 3, status: 'warning', delta: '2 Critical' },
  { id: '2', title: 'New Consults', value: 2, status: 'critical', delta: 'Last 1 hr' },
  { id: '3', title: 'Reviewed Today', value: 8, status: 'success' },
];

const mockCases: IntensivistDashboardData['cases'] = [
  { id: 'C1', patientName: 'S. Patel', age: 65, gender: 'M', unit: 'Medical ICU', diagnosis: 'Sepsis', riskScore: 18, keyIssue: 'Lactate non-clearing, persistent hypotension', priority: 'critical', status: 'pending_review' },
  { id: 'C2', patientName: 'A. Rao', age: 42, gender: 'F', unit: 'Neuro ICU', diagnosis: 'SAH', riskScore: 12, keyIssue: 'GCS drop from 12 to 9', priority: 'critical', status: 'pending_review' },
  { id: 'C3', patientName: 'R. Khan', age: 71, gender: 'M', unit: 'Cardiac ICU', diagnosis: 'Cardiogenic Shock', riskScore: 15, keyIssue: 'Weaning failure from IABP', priority: 'high_risk', status: 'reviewed' },
  { id: 'C4', patientName: 'M. Devi', age: 55, gender: 'F', unit: 'Medical ICU', diagnosis: 'ARDS', riskScore: 10, keyIssue: 'P/F ratio < 100', priority: 'high_risk', status: 'pending_review' },
];

const mockActiveReview: IntensivistDashboardData['activeReview'] = {
  caseInfo: mockCases[0],
  history: 'Day 3 in ICU. Admitted with pneumonia leading to septic shock. Currently on Noradrenaline and Vasopressin.',
  currentMeds: ['Noradrenaline 0.1 mcg/kg/min', 'Vasopressin 0.04 U/min', 'Meropenem 1g TDS', 'Hydrocortisone 50mg QDS'],
  vitalsHistory: [
    { timestamp: '10:00', hr: 110, bpSys: 85, bpDia: 50, spo2: 92, temp: 38.5 },
    { timestamp: '11:00', hr: 115, bpSys: 82, bpDia: 48, spo2: 93, temp: 38.8 },
    { timestamp: '12:00', hr: 118, bpSys: 78, bpDia: 45, spo2: 90, temp: 39.0 },
    { timestamp: '13:00', hr: 122, bpSys: 75, bpDia: 40, spo2: 89, temp: 39.2 },
  ],
  labs: [
    { id: 'L1', testName: 'Lactate', value: '6.8', unit: 'mmol/L', status: 'critical', trend: 'up', time: '12:30' },
    { id: 'L2', testName: 'WBC', value: '24,000', unit: '/mcL', status: 'abnormal', trend: 'up', time: '08:00' },
    { id: 'L3', testName: 'Creatinine', value: '2.1', unit: 'mg/dL', status: 'abnormal', trend: 'stable', time: '08:00' },
    { id: 'L4', testName: 'pH', value: '7.21', unit: '', status: 'critical', trend: 'down', time: '12:30' },
  ],
};

/* ── API Service ───────────────────────────────────────── */

export const intensivistApi = {
  getDashboardSummary: async (filters: IntensivistFilters) => ({
    data: {
      kpis: mockKpis,
      cases: mockCases,
      activeReview: mockActiveReview,
    } as IntensivistDashboardData,
    message: 'Success', status: 200,
  }),

  submitRecommendation: async (caseId: string, data: any) => ({ data: { success: true }, message: 'Recommendation saved', status: 200 }),
};
