/**
 * MedTrustX — Senior Resident API Client
 * Supervision and delegation data layer
 */
import type { SRDashboardData } from '../types/sr.types';

const BASE_URL = '/api/v1/clinical/sr';

export interface SRFilters {
  ward?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: SRDashboardData['kpis'] = [
  { id: '1', title: 'Ward Patients', value: 34, status: 'normal', delta: 'Gen Med + Pulmonary' },
  { id: '2', title: 'Unassigned Tasks', value: 4, status: 'warning', delta: 'Needs delegation' },
  { id: '3', title: 'Team Delays', value: 2, status: 'critical', delta: 'JR Workflow blocked' },
];

const mockPatients: SRDashboardData['patients'] = [
  { id: 'P1', patientName: 'A. Kumar', age: 45, gender: 'M', diagnosis: 'Pneumonia', status: 'stable', ward: 'Gen Med', bed: 'M-12' },
  { id: 'P2', patientName: 'S. Devi', age: 62, gender: 'F', diagnosis: 'COPD Exacerbation', status: 'critical', ward: 'Pulmonary', bed: 'P-04' },
  { id: 'P3', patientName: 'R. Singh', age: 28, gender: 'M', diagnosis: 'Viral Fever', status: 'watch', ward: 'Gen Med', bed: 'M-15' },
];

const mockTasks: SRDashboardData['tasks'] = [
  { id: 'T1', title: 'Review Morning Labs', patientId: 'P1', patientName: 'A. Kumar', assignedTo: undefined, status: 'unassigned', priority: 'medium', dueTime: '10:00 AM' },
  { id: 'T2', title: 'Perform ABG Draw', patientId: 'P2', patientName: 'S. Devi', assignedTo: 'Dr. Patel (JR)', status: 'assigned', priority: 'high', dueTime: '09:30 AM' },
  { id: 'T3', title: 'Update Progress Notes', patientId: 'P3', patientName: 'R. Singh', assignedTo: 'Dr. Lee (Intern)', status: 'in_progress', priority: 'low', dueTime: '12:00 PM' },
  { id: 'T4', title: 'Administer IV Antibiotics', patientId: 'P1', patientName: 'A. Kumar', assignedTo: 'Dr. Patel (JR)', status: 'completed', priority: 'high', dueTime: '08:00 AM' },
];

const mockTeam: SRDashboardData['team'] = [
  { id: 'JR1', name: 'Dr. Patel', role: 'JR', patientsAssigned: 8, tasksInProgress: 3, tasksDelayed: 1, status: 'busy' },
  { id: 'IN1', name: 'Dr. Lee', role: 'Intern', patientsAssigned: 4, tasksInProgress: 2, tasksDelayed: 0, status: 'active' },
  { id: 'JR2', name: 'Dr. Gupta', role: 'JR', patientsAssigned: 6, tasksInProgress: 0, tasksDelayed: 0, status: 'offline' },
];

const mockAlerts: SRDashboardData['alerts'] = [
  { id: 'A1', patientName: 'S. Devi', message: 'SpO2 drops continuing despite 2L O2. ABG draw delayed.', severity: 'critical', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'A2', patientName: 'R. Singh', message: 'Fever spiked to 39.5°C.', severity: 'warning', timestamp: new Date(Date.now() - 1200000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const srApi = {
  getDashboardSummary: async (filters: SRFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      tasks: mockTasks,
      team: mockTeam,
      alerts: mockAlerts,
    } as SRDashboardData,
    message: 'Success', status: 200,
  }),
  
  assignTask: async (taskId: string, userId: string) => ({ data: { success: true }, message: 'Task assigned', status: 200 }),
};
