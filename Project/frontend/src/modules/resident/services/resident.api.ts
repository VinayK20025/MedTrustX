/**
 * MedTrustX — Resident Doctor API Client
 * Task-heavy execution data layer
 */
import type { ResidentDashboardData } from '../types/resident.types';

const BASE_URL = '/api/v1/clinical/resident';

export interface ResidentFilters {
  view?: 'all' | 'my_patients' | 'tasks';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: ResidentDashboardData['kpis'] = [
  { id: '1', title: 'Pending Tasks', value: 8, status: 'warning', delta: '3 High Priority' },
  { id: '2', title: 'Completed Today', value: 24, status: 'success' },
  { id: '3', title: 'Assigned Patients', value: 15, status: 'normal', delta: 'Gen Med Ward' },
];

const mockPatients: ResidentDashboardData['patients'] = [
  { id: 'P1', patientName: 'A. Kumar', age: 45, gender: 'M', diagnosis: 'Community Acquired Pneumonia', ward: 'Gen Med', bed: 'M-12', status: 'stable', lastVitals: '1 hour ago' },
  { id: 'P2', patientName: 'S. Devi', age: 62, gender: 'F', diagnosis: 'Exacerbation of COPD', ward: 'Pulmonary', bed: 'P-04', status: 'critical', lastVitals: '15 mins ago' },
  { id: 'P3', patientName: 'R. Singh', age: 28, gender: 'M', diagnosis: 'Acute Gastroenteritis', ward: 'Gen Med', bed: 'M-15', status: 'discharge_ready', lastVitals: '4 hours ago' },
];

const mockTasks: ResidentDashboardData['tasks'] = [
  { id: 'T1', title: 'Review Morning ABG', patientId: 'P2', patientName: 'S. Devi', dueTime: '10:00 AM', type: 'labs', priority: 'high', status: 'todo' },
  { id: 'T2', title: 'Update Daily Progress Note', patientId: 'P1', patientName: 'A. Kumar', dueTime: '11:00 AM', type: 'notes', priority: 'medium', status: 'in_progress' },
  { id: 'T3', title: 'Central Line Dressing Change', patientId: 'P2', patientName: 'S. Devi', dueTime: '12:00 PM', type: 'procedure', priority: 'high', status: 'todo' },
  { id: 'T4', title: 'Prepare Discharge Summary', patientId: 'P3', patientName: 'R. Singh', dueTime: '01:00 PM', type: 'notes', priority: 'low', status: 'todo' },
  { id: 'T5', title: 'Administer IV Antibiotics', patientId: 'P1', patientName: 'A. Kumar', dueTime: '08:00 AM', type: 'meds', priority: 'high', status: 'done' },
];

const mockAlerts: ResidentDashboardData['alerts'] = [
  { id: 'A1', patientId: 'P2', patientName: 'S. Devi', message: 'SpO2 dropped to 88% on 2L O2', severity: 'critical', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'A2', patientId: 'P1', patientName: 'A. Kumar', message: 'Blood culture positive for Gram-positive cocci', severity: 'warning', timestamp: new Date(Date.now() - 1800000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const residentApi = {
  getDashboardSummary: async (filters: ResidentFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      tasks: mockTasks,
      alerts: mockAlerts,
    } as ResidentDashboardData,
    message: 'Success', status: 200,
  }),
  
  updateTaskStatus: async (taskId: string, status: string) => ({ data: { success: true }, message: 'Task updated', status: 200 }),
};
