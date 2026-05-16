/**
 * MedTrustX — COO API Client
 */
import { apiGet, apiPost } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type { CooDashboardData, CooAlert, CooTask } from '../types/coo.types';

const BASE_URL = '/api/v1/operations/coo';

export interface CooFilters {
  departmentId?: string;
  timeWindow?: '1h' | '4h' | 'shift' | 'today';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CooDashboardData['kpis'] = [
  { id: '1', title: 'Patients in Queue', value: 45, status: 'warning', actionLabel: 'View Queue', actionUrl: '/dashboard/coo/patient-flow/queue' },
  { id: '2', title: 'Bed Occupancy', value: '94%', status: 'critical', actionLabel: 'Manage Beds', actionUrl: '/dashboard/coo/beds' },
  { id: '3', title: 'ICU Capacity', value: '98%', status: 'critical', actionLabel: 'View ICU', actionUrl: '/dashboard/coo/clinical-ops/icu' },
  { id: '4', title: 'Pending Discharges', value: 28, status: 'warning', actionLabel: 'Resolve', actionUrl: '/dashboard/coo/patient-flow/discharges' },
  { id: '5', title: 'OT Backlog', value: 3, status: 'warning', actionLabel: 'View OT', actionUrl: '/dashboard/coo/clinical-ops/ot' },
  { id: '6', title: 'Staff Availability', value: '88%', status: 'good', actionLabel: 'Allocate', actionUrl: '/dashboard/coo/resources/staff' },
];

const mockPatientFlow: CooDashboardData['patientFlow'] = {
  admissionsQueue: 18,
  inProgress: 142,
  dischargeQueue: 28,
  avgWaitTime: 45,
};

const mockBeds: CooDashboardData['beds'] = {
  totalBeds: 500,
  occupiedBeds: 470,
  availableBeds: 25,
  blockedBeds: 5,
  occupancyByWard: [
    { ward: 'General Ward A', occupied: 48, capacity: 50 },
    { ward: 'General Ward B', occupied: 45, capacity: 50 },
    { ward: 'Maternity', occupied: 38, capacity: 40 },
    { ward: 'Pediatrics', occupied: 28, capacity: 30 },
    { ward: 'Orthopedics', occupied: 40, capacity: 40 },
  ],
};

const mockIcu: CooDashboardData['icu'] = {
  totalBeds: 50,
  occupiedBeds: 49,
  criticalPatients: 12,
  availableVentilators: 4,
  nurseToPatientRatio: '1:2',
};

const mockOt: CooDashboardData['ot'] = {
  activeSurgeries: 8,
  scheduledSurgeries: 14,
  delayedSurgeries: 3,
  avgTurnaroundTime: 25,
};

const mockAlerts: CooAlert[] = [
  { id: 'A1', type: 'critical', message: 'ER queue overflow: 15 patients waiting > 1 hour.', timestamp: new Date().toISOString(), location: 'Emergency', actionRequired: true },
  { id: 'A2', type: 'critical', message: 'ICU beds unavailable. 1 patient pending transfer from OT.', timestamp: new Date(Date.now() - 300000).toISOString(), location: 'ICU-A', actionRequired: true },
  { id: 'A3', type: 'warning', message: 'OT delay cascade: Room 3 delayed by 45 mins.', timestamp: new Date(Date.now() - 1800000).toISOString(), location: 'Main OT', actionRequired: true },
];

const mockTasks: CooTask[] = [
  { id: 'T1', title: 'Assign float nurse to ICU', description: 'Address critical staffing ratio in ICU-A.', priority: 'high', status: 'pending', timestamp: new Date(Date.now() - 900000).toISOString() },
  { id: 'T2', title: 'Approve emergency bed allocation', description: 'Convert 2 recovery beds to ICU step-down.', priority: 'high', status: 'pending', timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: 'T3', title: 'Reassign OT schedule', description: 'Manage Room 3 delay cascade.', priority: 'medium', status: 'pending', timestamp: new Date(Date.now() - 3600000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const cooApi = {
  getDashboardSummary: async (filters: CooFilters) => ({
    data: {
      kpis: mockKpis,
      patientFlow: mockPatientFlow,
      beds: mockBeds,
      icu: mockIcu,
      ot: mockOt,
      alerts: mockAlerts,
      tasks: mockTasks,
    } as CooDashboardData,
    message: 'Success',
    status: 200,
  }),

  resolveAlert: async (alertId: string, actionType: 'assign' | 'resolve' | 'escalate') => {
    return { data: { success: true }, message: `Alert ${actionType} successful`, status: 200 };
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    return { data: { success: true }, message: 'Task updated', status: 200 };
  }
};
