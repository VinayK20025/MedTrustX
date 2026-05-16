/**
 * MedTrustX — General Physician API Client
 * High-speed OPD data layer
 */
import type { GPDashboardData } from '../types/gp.types';

const BASE_URL = '/api/v1/clinical/gp';

export interface GPFilters {
  status?: 'waiting' | 'all';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: GPDashboardData['kpis'] = [
  { id: '1', title: 'Patients Seen', value: 34, status: 'success', delta: '+4 vs yesterday' },
  { id: '2', title: 'Pending Queue', value: 12, status: 'warning', delta: 'Avg wait: 24m' },
  { id: '3', title: 'Avg Consult Time', value: '6.2m', status: 'normal', delta: 'Target < 8m' },
  { id: '4', title: 'Referrals Made', value: 3, status: 'normal', delta: '2 Cardio, 1 Ortho' },
];

const mockQueue: GPDashboardData['queue'] = [
  { id: 'Q1', name: 'A. Sharma', age: 45, gender: 'M', symptoms: 'Fever, cough x 3 days', waitingTime: 45, priority: 'routine', status: 'waiting', checkedInAt: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'Q2', name: 'S. Verma', age: 28, gender: 'F', symptoms: 'Severe abdominal pain', waitingTime: 15, priority: 'urgent', status: 'waiting', checkedInAt: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'Q3', name: 'R. Kumar', age: 52, gender: 'M', symptoms: 'Routine checkup, refill', waitingTime: 55, priority: 'routine', status: 'waiting', checkedInAt: new Date(Date.now() - 55 * 60000).toISOString() },
  { id: 'Q4', name: 'M. Devi', age: 65, gender: 'F', symptoms: 'Dizziness, high BP reading', waitingTime: 5, priority: 'urgent', status: 'waiting', checkedInAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 'Q5', name: 'V. Singh', age: 34, gender: 'M', symptoms: 'Sprained ankle', waitingTime: 20, priority: 'routine', status: 'waiting', checkedInAt: new Date(Date.now() - 20 * 60000).toISOString() },
];

const mockConsultation: GPDashboardData['currentConsultation'] = {
  patientId: 'Q0',
  patientName: 'P. Krishnan',
  age: 41,
  gender: 'M',
  chiefComplaint: 'Sore throat, mild fever since yesterday',
  vitals: { temp: 38.2, bp: '120/80', hr: 88, spo2: 98 },
  allergies: ['Penicillin'],
  alerts: ['Fever 38.2°C'],
};

const mockAlerts: GPDashboardData['alerts'] = [
  { id: 'A1', type: 'wait_time', severity: 'warning', message: 'R. Kumar waiting > 50 mins', patientName: 'R. Kumar', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'A2', type: 'vitals', severity: 'critical', message: 'M. Devi — Triage BP 180/110', patientName: 'M. Devi', timestamp: new Date(Date.now() - 60000).toISOString() },
];

const mockPresets: GPDashboardData['presets'] = [
  { id: 'P1', name: 'Viral Fever', drug: 'Paracetamol 500mg', dosage: '1-1-1 (TID)', duration: '3 days' },
  { id: 'P2', name: 'Gastritis', drug: 'Pantoprazole 40mg', dosage: '1-0-0 (OD) before food', duration: '5 days' },
  { id: 'P3', name: 'Allergic Rhinitis', drug: 'Levocetirizine 5mg', dosage: '0-0-1 (HS)', duration: '5 days' },
];

/* ── API Service ───────────────────────────────────────── */

export const gpApi = {
  getDashboardSummary: async (filters: GPFilters) => ({
    data: {
      kpis: mockKpis,
      queue: filters.status === 'waiting' ? mockQueue.filter(q => q.status === 'waiting') : mockQueue,
      currentConsultation: mockConsultation,
      alerts: mockAlerts,
      presets: mockPresets,
    } as GPDashboardData,
    message: 'Success', status: 200,
  }),

  submitConsultation: async (patientId: string, data: any) => ({ data: { success: true }, message: 'Consultation saved', status: 200 }),
  callNextPatient: async () => ({ data: { success: true }, message: 'Next patient called', status: 200 }),
};
