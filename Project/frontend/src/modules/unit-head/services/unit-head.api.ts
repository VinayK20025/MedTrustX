/**
 * MedTrustX — Unit Head API Client
 * Real-time Critical Care data layer
 */
import type { UnitHeadDashboardData } from '../types/unit-head.types';

const BASE_URL = '/api/v1/clinical/unit-head';

export interface UnitFilters {
  unit?: 'icu' | 'er' | 'ot' | 'dialysis';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: UnitHeadDashboardData['kpis'] = [
  { id: '1', title: 'Total Patients', value: 12, status: 'normal', delta: '12/14 beds', actionLabel: 'Grid', actionUrl: '/dashboard/unit-head/patients' },
  { id: '2', title: 'Critical', value: 4, status: 'critical', delta: '2 deteriorating', actionLabel: 'View', actionUrl: '/dashboard/unit-head/critical' },
  { id: '3', title: 'On Ventilator', value: 6, status: 'warning', delta: '2 weaning', actionLabel: 'Track', actionUrl: '/dashboard/unit-head/vitals' },
  { id: '4', title: 'Code Blue (24h)', value: 1, status: 'critical', delta: 'Bed A-6, 03:42', actionLabel: 'Log', actionUrl: '/dashboard/unit-head/alerts' },
  { id: '5', title: 'Staff On Duty', value: 8, status: 'normal', delta: '2 nurses, 1 RT', actionLabel: 'Roster', actionUrl: '/dashboard/unit-head/staff' },
];

const mockPatients: UnitHeadDashboardData['patients'] = [
  { id: 'BP1', bed: 'A-1', name: 'R. Krishnan', age: 62, gender: 'M', diagnosis: 'Post-CABG Day 2 — hemodynamic monitoring', severity: 'serious', vitals: { hr: 92, bp: '118/72', spo2: 96, rr: 18, temp: 37.1, gcs: 15 }, ventilator: false, alerts: [], admittedAt: new Date(Date.now() - 172800000).toISOString(), attendingDoctor: 'Dr. Sharma', nurse: 'Nr. Thomas' },
  { id: 'BP2', bed: 'A-2', name: 'M. Singh', age: 71, gender: 'M', diagnosis: 'Severe sepsis — multiorgan support', severity: 'critical', vitals: { hr: 128, bp: '82/48', spo2: 88, rr: 28, temp: 39.4, gcs: 9 }, ventilator: true, alerts: ['SpO2 <90%', 'MAP <65', 'Lactate 6.2'], admittedAt: new Date(Date.now() - 86400000).toISOString(), attendingDoctor: 'Dr. Patel', nurse: 'Nr. Kumari' },
  { id: 'BP3', bed: 'A-3', name: 'P. Gupta', age: 55, gender: 'F', diagnosis: 'ARDS — prone positioning, FiO2 80%', severity: 'critical', vitals: { hr: 110, bp: '95/58', spo2: 91, rr: 32, temp: 38.2, gcs: 8 }, ventilator: true, alerts: ['High FiO2', 'P/F ratio 92'], admittedAt: new Date(Date.now() - 259200000).toISOString(), attendingDoctor: 'Dr. Sharma', nurse: 'Nr. Reddy' },
  { id: 'BP4', bed: 'A-4', name: 'K. Nair', age: 48, gender: 'M', diagnosis: 'Status epilepticus — controlled, monitoring', severity: 'serious', vitals: { hr: 78, bp: '132/84', spo2: 97, rr: 16, temp: 36.8, gcs: 11 }, ventilator: true, alerts: ['GCS <12'], admittedAt: new Date(Date.now() - 432000000).toISOString(), attendingDoctor: 'Dr. Patel', nurse: 'Nr. Thomas' },
  { id: 'BP5', bed: 'A-5', name: 'S. Devi', age: 34, gender: 'F', diagnosis: 'Post-emergency C-section — PPH stabilized', severity: 'moderate', vitals: { hr: 98, bp: '108/68', spo2: 98, rr: 20, temp: 37.0, gcs: 15 }, ventilator: false, alerts: [], admittedAt: new Date(Date.now() - 43200000).toISOString(), attendingDoctor: 'Dr. Rao', nurse: 'Nr. Kumari' },
  { id: 'BP6', bed: 'A-6', name: 'A. Khan', age: 67, gender: 'M', diagnosis: 'Acute MI + cardiogenic shock — IABP', severity: 'critical', vitals: { hr: 134, bp: '76/42', spo2: 86, rr: 30, temp: 37.6, gcs: 10 }, ventilator: true, alerts: ['SpO2 <90%', 'BP critical', 'Code Blue resolved 03:42'], admittedAt: new Date(Date.now() - 28800000).toISOString(), attendingDoctor: 'Dr. Sharma', nurse: 'Nr. Reddy' },
  { id: 'BP7', bed: 'B-1', name: 'L. Sharma', age: 42, gender: 'F', diagnosis: 'DKA — insulin drip, fluid resuscitation', severity: 'serious', vitals: { hr: 104, bp: '100/62', spo2: 97, rr: 24, temp: 37.3, gcs: 14 }, ventilator: false, alerts: ['K+ 5.8 — repeat stat'], admittedAt: new Date(Date.now() - 64800000).toISOString(), attendingDoctor: 'Dr. Patel', nurse: 'Nr. Thomas' },
  { id: 'BP8', bed: 'B-2', name: 'V. Reddy', age: 59, gender: 'M', diagnosis: 'Post-craniotomy — neuro monitoring', severity: 'serious', vitals: { hr: 68, bp: '140/88', spo2: 99, rr: 14, temp: 36.6, gcs: 12 }, ventilator: true, alerts: [], admittedAt: new Date(Date.now() - 129600000).toISOString(), attendingDoctor: 'Dr. Rao', nurse: 'Nr. Kumari' },
];

const mockStaff: UnitHeadDashboardData['staff'] = [
  { id: 'US1', name: 'Dr. A. Sharma', role: 'intensivist', status: 'on_duty', assignedBeds: ['A-1', 'A-3', 'A-6'], shift: 'Morning' },
  { id: 'US2', name: 'Dr. R. Patel', role: 'intensivist', status: 'on_duty', assignedBeds: ['A-2', 'A-4', 'B-1'], shift: 'Morning' },
  { id: 'US3', name: 'Dr. S. Rao', role: 'registrar', status: 'on_duty', assignedBeds: ['A-5', 'B-2'], shift: 'Morning' },
  { id: 'US4', name: 'Nr. J. Thomas', role: 'nurse', status: 'on_duty', assignedBeds: ['A-1', 'A-4', 'B-1'], shift: 'Morning' },
  { id: 'US5', name: 'Nr. P. Kumari', role: 'nurse', status: 'on_duty', assignedBeds: ['A-2', 'A-5', 'B-2'], shift: 'Morning' },
  { id: 'US6', name: 'Nr. M. Reddy', role: 'nurse', status: 'on_duty', assignedBeds: ['A-3', 'A-6'], shift: 'Morning' },
  { id: 'US7', name: 'RT S. Kumar', role: 'respiratory_therapist', status: 'on_duty', assignedBeds: ['A-2', 'A-3', 'A-4', 'A-6', 'B-2'], shift: 'Morning' },
  { id: 'US8', name: 'Dr. N. Mehta', role: 'intensivist', status: 'on_call', assignedBeds: [], shift: 'On-call' },
];

const mockAlerts: UnitHeadDashboardData['alerts'] = [
  { id: 'UA1', type: 'vitals_critical', severity: 'critical', message: 'SpO2 dropped to 86% — desaturation event', bed: 'A-6', patientName: 'A. Khan', timestamp: new Date(Date.now() - 300000).toISOString(), acknowledged: false },
  { id: 'UA2', type: 'vitals_critical', severity: 'critical', message: 'MAP <65 mmHg — hemodynamic instability, vasopressor review needed', bed: 'A-2', patientName: 'M. Singh', timestamp: new Date(Date.now() - 600000).toISOString(), acknowledged: false },
  { id: 'UA3', type: 'lab_critical', severity: 'critical', message: 'K+ 5.8 mEq/L — hyperkalemia, repeat stat and EKG ordered', bed: 'B-1', patientName: 'L. Sharma', timestamp: new Date(Date.now() - 1200000).toISOString(), acknowledged: true },
  { id: 'UA4', type: 'ventilator', severity: 'warning', message: 'P/F ratio 92 — ARDS severe, consider proning', bed: 'A-3', patientName: 'P. Gupta', timestamp: new Date(Date.now() - 1800000).toISOString(), acknowledged: true },
  { id: 'UA5', type: 'code_blue', severity: 'critical', message: 'Code Blue activated and resolved — VF arrest, ROSC achieved', bed: 'A-6', patientName: 'A. Khan', timestamp: new Date(Date.now() - 72000000).toISOString(), acknowledged: true },
  { id: 'UA6', type: 'medication_delay', severity: 'warning', message: 'Noradrenaline infusion not started — 15 min overdue', bed: 'A-2', patientName: 'M. Singh', timestamp: new Date(Date.now() - 900000).toISOString(), acknowledged: false },
];

/* ── API Service ───────────────────────────────────────── */

export const unitHeadApi = {
  getDashboardSummary: async (filters: UnitFilters) => ({
    data: {
      unitName: 'Medical ICU',
      unitType: 'icu' as const,
      kpis: mockKpis,
      patients: mockPatients,
      staff: mockStaff,
      alerts: mockAlerts,
    } as UnitHeadDashboardData,
    message: 'Success',
    status: 200,
  }),

  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Acknowledged', status: 200 }),
  triggerIntervention: async (patientId: string, type: string) => ({ data: { success: true }, message: 'Triggered', status: 200 }),
};
