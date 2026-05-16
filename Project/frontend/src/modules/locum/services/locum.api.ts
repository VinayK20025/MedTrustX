/**
 * MedTrustX — Locum Doctor API Client
 * Context-limited data layer for shift continuity
 */
import type { LocumDashboardData } from '../types/locum.types';

const BASE_URL = '/api/v1/clinical/locum';

export interface LocumFilters {
  shiftId?: string;
  view?: 'all' | 'critical';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: LocumDashboardData['kpis'] = [
  { id: '1', title: 'Assigned Patients', value: 12, status: 'normal', delta: 'Shift: 08:00-20:00' },
  { id: '2', title: 'Pending Tasks', value: 5, status: 'warning', delta: 'From Handover' },
  { id: '3', title: 'Critical Alerts', value: 1, status: 'critical', delta: 'Requires action' },
];

const mockAssignedPatients: LocumDashboardData['assignedPatients'] = [
  { id: 'P1', patientName: 'A. Kumar', age: 45, gender: 'M', diagnosis: 'Community Acquired Pneumonia', ward: 'Gen Med', bed: 'M-12', lastUpdate: '2 hours ago', riskFlag: 'watch', handoverPending: true },
  { id: 'P2', patientName: 'S. Devi', age: 62, gender: 'F', diagnosis: 'Exacerbation of COPD', ward: 'Pulmonary', bed: 'P-04', lastUpdate: '1 hour ago', riskFlag: 'critical', handoverPending: false },
  { id: 'P3', patientName: 'R. Singh', age: 28, gender: 'M', diagnosis: 'Acute Gastroenteritis', ward: 'Gen Med', bed: 'M-15', lastUpdate: '4 hours ago', riskFlag: 'stable', handoverPending: false },
  { id: 'P4', patientName: 'M. Khan', age: 55, gender: 'M', diagnosis: 'Uncontrolled T2DM', ward: 'Endocrine', bed: 'E-02', lastUpdate: '30 mins ago', riskFlag: 'watch', handoverPending: true },
];

const mockActiveSnapshot: LocumDashboardData['activeSnapshot'] = {
  id: 'P2',
  patientName: 'S. Devi',
  allergies: ['Penicillin', 'Sulfa'],
  primaryDiagnosis: 'Exacerbation of COPD',
  currentPlan: [
    'Continue IV Corticosteroids',
    'Nebulization every 4 hours',
    'Monitor ABG if SpO2 drops below 88%'
  ],
  keyHistory: [
    { date: 'Yesterday 14:00', event: 'Admitted via ER with severe dyspnea' },
    { date: 'Yesterday 22:00', event: 'Started on BiPAP overnight' },
    { date: 'Today 06:00', event: 'Weaned off BiPAP, currently on 2L O2' }
  ],
  activeMeds: [
    { name: 'Hydrocortisone', dosage: '100mg IV', schedule: 'Q8H' },
    { name: 'Salbutamol Neb', dosage: '2.5mg', schedule: 'Q4H' },
    { name: 'Azithromycin', dosage: '500mg IV', schedule: 'OD' }
  ],
  alerts: ['High risk for respiratory failure', 'Missed morning nebulization'],
  vitals: { hr: 102, bp: '135/85', temp: 37.2, spo2: 90 },
};

const mockHandover: LocumDashboardData['handover'] = {
  incomingNotes: 'Covering Dr. Sharma\'s patients. Watch S. Devi (P-04) closely for desaturation. A. Kumar (M-12) needs blood cultures chased.',
  warnings: ['S. Devi may need ICU transfer if ABG worsens.'],
  pendingTasks: [
    { id: 'T1', patientId: 'P1', patientName: 'A. Kumar', task: 'Check Blood Cultures', priority: 'high', status: 'pending' },
    { id: 'T2', patientId: 'P2', patientName: 'S. Devi', task: 'Review evening ABG', priority: 'high', status: 'pending' },
    { id: 'T3', patientId: 'P4', patientName: 'M. Khan', task: 'Adjust evening insulin', priority: 'medium', status: 'pending' },
  ],
};

/* ── API Service ───────────────────────────────────────── */

export const locumApi = {
  getDashboardSummary: async (filters: LocumFilters) => ({
    data: {
      kpis: mockKpis,
      assignedPatients: mockAssignedPatients,
      activeSnapshot: mockActiveSnapshot,
      handover: mockHandover,
    } as LocumDashboardData,
    message: 'Success', status: 200,
  }),
};
