/**
 * MedTrustX — ER Nurse API Client
 * Fast polling API for rapid triage queue management
 */
import type { ERDashboardData } from '../types/er.types';

const BASE_URL = '/api/v1/nursing/er-nurse';

export interface ERFilters {
  zone?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: ERDashboardData['kpis'] = [
  { id: '1', title: 'Patients Waiting', value: 14, status: 'warning', delta: 'Avg wait: 45m' },
  { id: '2', title: 'Critical / Resus', value: 2, status: 'critical', delta: 'Immediate action' },
  { id: '3', title: 'Pending Transfers', value: 3, status: 'normal', delta: 'To ICU/Ward' },
];

const mockTriageQueue: ERDashboardData['triageQueue'] = [
  { id: 'Q1', name: 'Unknown Male (Trauma)', symptoms: 'Blunt force trauma, unconscious', arrivalTime: '10:05 AM', triageLevel: 'critical', waitTimeMins: 2 },
  { id: 'Q2', name: 'Maria Garcia', symptoms: 'Severe chest pain, diaphoresis', arrivalTime: '10:00 AM', triageLevel: 'critical', waitTimeMins: 7 },
  { id: 'Q3', name: 'David Smith', symptoms: 'Laceration to right arm', arrivalTime: '09:30 AM', triageLevel: 'urgent', waitTimeMins: 37 },
  { id: 'Q4', name: 'Lisa Johnson', symptoms: 'Mild fever, cough', arrivalTime: '08:15 AM', triageLevel: 'stable', waitTimeMins: 112 },
];

const mockActivePatients: ERDashboardData['activePatients'] = [
  { id: 'P1', name: 'John Doe', location: 'Resus Bay 1', status: 'resus', chiefComplaint: 'Cardiac Arrest', alerts: 2 },
  { id: 'P2', name: 'Sarah Connor', location: 'Bay 4', status: 'treatment', chiefComplaint: 'Asthma Exacerbation', alerts: 0 },
  { id: 'P3', name: 'Robert Miles', location: 'Hallway B', status: 'waiting_transfer', chiefComplaint: 'Appendicitis', alerts: 0 },
];

const mockCareActions: ERDashboardData['careActions'] = [
  { id: 'C1', title: 'Initiate O2 (15L Non-Rebreather)', type: 'oxygen', status: 'ready' },
  { id: 'C2', title: 'Stat 12-Lead ECG', type: 'ecg', status: 'ready' },
  { id: 'C3', title: '1L Normal Saline Bolus', type: 'iv_fluid', status: 'in_progress' },
  { id: 'C4', title: 'Administer Epinephrine 1mg', type: 'injection', status: 'ready' },
];

const mockAlerts: ERDashboardData['alerts'] = [
  { id: 'A1', type: 'incoming_trauma', message: 'ETA 5 mins: MVA, multiple casualties', severity: 'critical', timestamp: new Date().toISOString() },
  { id: 'A2', type: 'cardiac_arrest', message: 'Code Blue - Resus Bay 1', location: 'Resus Bay 1', severity: 'critical', timestamp: new Date(Date.now() - 30000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const erApi = {
  getDashboardSummary: async (filters: ERFilters) => ({
    data: {
      kpis: mockKpis,
      triageQueue: mockTriageQueue,
      activePatients: mockActivePatients,
      careActions: mockCareActions,
      alerts: mockAlerts,
    } as ERDashboardData,
    message: 'Success', status: 200,
  }),
};
