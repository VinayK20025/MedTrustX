/**
 * MedTrustX — Ward In-Charge API Client
 * Ward-level care execution and staff management data
 */
import type { WardDashboardData } from '../types/ward.types';

const BASE_URL = '/api/v1/nursing/ward-incharge';

export interface WardFilters {
  wardId?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: WardDashboardData['kpis'] = [
  { id: '1', title: 'Ward Patients', value: 24, status: 'normal', delta: '85% occupancy' },
  { id: '2', title: 'Pending Tasks', value: 15, status: 'warning', delta: '3 delayed' },
  { id: '3', title: 'Critical Patients', value: 2, status: 'critical', delta: 'Needs monitoring' },
];

const mockPatients: WardDashboardData['patients'] = [
  { id: 'P1', name: 'James Wilson', bed: 'Bed 12', diagnosis: 'Post-op Recovery', status: 'critical', assignedNurse: 'N. Sharma', alerts: 1 },
  { id: 'P2', name: 'Sarah Connor', bed: 'Bed 14', diagnosis: 'Pneumonia', status: 'observation', assignedNurse: 'J. Doe', alerts: 0 },
  { id: 'P3', name: 'Robert Miles', bed: 'Bed 15', diagnosis: 'Fracture', status: 'stable', assignedNurse: 'T. Williams', alerts: 0 },
];

const mockStaff: WardDashboardData['staff'] = [
  { id: 'N1', name: 'N. Sharma', role: 'Staff Nurse', status: 'busy', patientLoad: 4 },
  { id: 'N2', name: 'J. Doe', role: 'Staff Nurse', status: 'active', patientLoad: 5 },
  { id: 'N3', name: 'T. Williams', role: 'Junior Nurse', status: 'break', patientLoad: 3 },
];

const mockTasks: WardDashboardData['tasks'] = [
  { id: 'T1', title: 'Administer IV Antibiotics', type: 'medication', patientName: 'James Wilson', bed: 'Bed 12', assignedNurse: 'N. Sharma', status: 'todo', dueDate: '10:30 AM', priority: 'high' },
  { id: 'T2', title: 'Check Vitals Q4H', type: 'vitals', patientName: 'Sarah Connor', bed: 'Bed 14', status: 'in_progress', dueDate: '11:00 AM', priority: 'medium' },
  { id: 'T3', title: 'Wound Dressing Change', type: 'procedure', patientName: 'Robert Miles', bed: 'Bed 15', assignedNurse: 'T. Williams', status: 'completed', dueDate: '09:00 AM', priority: 'medium' },
];

const mockAlerts: WardDashboardData['alerts'] = [
  { id: 'A1', type: 'patient_critical', message: 'Vitals dropping for James Wilson (Bed 12)', patientId: 'P1', severity: 'high', timestamp: new Date().toISOString() },
  { id: 'A2', type: 'task_delay', message: 'Medication administration delayed > 15m (Bed 14)', severity: 'medium', timestamp: new Date(Date.now() - 900000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const wardApi = {
  getDashboardSummary: async (filters: WardFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      staff: mockStaff,
      tasks: mockTasks,
      alerts: mockAlerts,
    } as WardDashboardData,
    message: 'Success', status: 200,
  }),
};
