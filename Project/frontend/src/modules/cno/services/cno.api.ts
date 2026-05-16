/**
 * MedTrustX — CNO API Client
 */
import { apiGet, apiPost } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type { CnoDashboardData, CnoAlert, NursingTask } from '../types/cno.types';

const BASE_URL = '/api/v1/nursing/cno';

export interface CnoFilters {
  wardId?: string;
  shiftId?: 'current' | 'next' | 'previous';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CnoDashboardData['kpis'] = [
  { id: '1', title: 'Pending Tasks', value: 42, status: 'warning', actionLabel: 'View Board', actionUrl: '/dashboard/cno/tasks' },
  { id: '2', title: 'Missed Tasks', value: 8, status: 'critical', actionLabel: 'Investigate', actionUrl: '/dashboard/cno/compliance' },
  { id: '3', title: 'Completed Tasks', value: 185, status: 'good', actionLabel: 'View Log', actionUrl: '/dashboard/cno/tasks' },
  { id: '4', title: 'Avg Nurse:Patient', value: '1:4.2', status: 'warning', actionLabel: 'Allocate Staff', actionUrl: '/dashboard/cno/staffing' },
];

const mockTasks: NursingTask[] = [
  { id: 'T1', patientName: 'Ravi Kumar', room: 'ICU-3', taskType: 'medication', description: 'Administer IV Antibiotics', dueTime: new Date(Date.now() - 900000).toISOString(), assignedTo: 'Nurse A. Sharma', status: 'missed', priority: 'high' },
  { id: 'T2', patientName: 'Sunita Devi', room: 'Ward 4B', taskType: 'vitals', description: 'Hourly vitals check', dueTime: new Date(Date.now() + 1800000).toISOString(), status: 'pending', priority: 'medium' },
  { id: 'T3', patientName: 'John Doe', room: 'Ward 2A', taskType: 'procedure', description: 'Wound dressing change', dueTime: new Date(Date.now() - 3600000).toISOString(), assignedTo: 'Nurse M. Singh', status: 'in_progress', priority: 'medium' },
  { id: 'T4', patientName: 'Amina B.', room: 'ICU-1', taskType: 'monitoring', description: 'Neuro assessment', dueTime: new Date(Date.now() + 3600000).toISOString(), status: 'pending', priority: 'high' },
];

const mockStaffing: CnoDashboardData['staffing'] = {
  totalOnShift: 84,
  requiredStaff: 92,
  ratio: '1:4.2',
  shortages: [
    { ward: 'ICU-A', required: 12, actual: 10 },
    { ward: 'Emergency', required: 15, actual: 12 },
    { ward: 'Ward 4B', required: 8, actual: 6 },
  ]
};

const mockCareStatus: CnoDashboardData['careStatus'] = {
  onTime: 82,
  delayed: 14,
  missed: 4,
  criticalPatients: 18,
};

const mockShift: CnoDashboardData['shift'] = {
  currentShift: 'Morning (08:00 - 16:00)',
  shiftManager: 'Matron K. Patel',
  handoversPending: 3,
  incidentsReported: 1,
};

const mockAlerts: CnoAlert[] = [
  { id: 'A1', type: 'critical', message: 'Staffing shortage in Emergency. Minimum safe ratio exceeded.', timestamp: new Date().toISOString(), ward: 'Emergency', actionRequired: true },
  { id: 'A2', type: 'warning', message: 'Vitals missed for 3 patients in Ward 4B.', timestamp: new Date(Date.now() - 1800000).toISOString(), ward: 'Ward 4B', actionRequired: true },
  { id: 'A3', type: 'info', message: 'Shift handover incomplete for ICU-B.', timestamp: new Date(Date.now() - 3600000).toISOString(), ward: 'ICU-B', actionRequired: true },
];

/* ── API Service ───────────────────────────────────────── */

export const cnoApi = {
  getDashboardSummary: async (filters: CnoFilters) => ({
    data: {
      kpis: mockKpis,
      tasks: mockTasks,
      staffing: mockStaffing,
      careStatus: mockCareStatus,
      shift: mockShift,
      alerts: mockAlerts,
    } as CnoDashboardData,
    message: 'Success',
    status: 200,
  }),

  assignTask: async (taskId: string, nurseId: string) => {
    return { data: { success: true }, message: 'Task assigned', status: 200 };
  },

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  }
};
