/**
 * MedTrustX — Medical Superintendent API Client
 * Clinical Operations data layer
 */
import type { SuperintendentDashboardData } from '../types/superintendent.types';

const BASE_URL = '/api/v1/clinical/superintendent';

export interface SuperFilters {
  shift?: 'morning' | 'afternoon' | 'night' | 'all';
  department?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: SuperintendentDashboardData['kpis'] = [
  { id: '1', title: 'Admissions Today', value: 42, status: 'normal', delta: '+8 vs yesterday', actionLabel: 'View Queue', actionUrl: '/dashboard/superintendent/patient-flow' },
  { id: '2', title: 'Pending Discharges', value: 36, status: 'warning', delta: '12 delayed', actionLabel: 'Resolve', actionUrl: '/dashboard/superintendent/patient-flow' },
  { id: '3', title: 'Bed Occupancy', value: '87%', status: 'warning', delta: '+3% from shift start', actionLabel: 'Wards', actionUrl: '/dashboard/superintendent/wards' },
  { id: '4', title: 'ICU Load', value: '92%', status: 'critical', delta: '2 beds available', actionLabel: 'ICU Status', actionUrl: '/dashboard/superintendent/icu' },
  { id: '5', title: 'OT Backlog', value: 4, status: 'warning', delta: '2 delayed surgeries', actionLabel: 'OT Queue', actionUrl: '/dashboard/superintendent/ot' },
  { id: '6', title: 'Active Complaints', value: 3, status: 'warning', delta: '1 critical', actionLabel: 'Review', actionUrl: '/dashboard/superintendent/incidents' },
];

const mockPatientFlow: SuperintendentDashboardData['patientFlow'] = [
  { id: 'PF1', type: 'admission', patientName: 'R. Patel', department: 'Medicine', ward: 'Ward 3A', status: 'in_progress', priority: 'urgent', requestedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'PF2', type: 'discharge', patientName: 'S. Gupta', department: 'Surgery', ward: 'Ward 2B', status: 'delayed', priority: 'routine', requestedAt: new Date(Date.now() - 14400000).toISOString(), delayReason: 'Pending final billing clearance' },
  { id: 'PF3', type: 'discharge', patientName: 'M. Khan', department: 'Medicine', ward: 'Ward 3A', status: 'delayed', priority: 'routine', requestedAt: new Date(Date.now() - 10800000).toISOString(), delayReason: 'Awaiting pharmacy discharge meds' },
  { id: 'PF4', type: 'transfer', patientName: 'A. Singh', department: 'ICU', ward: 'ICU Bed 4', status: 'pending', priority: 'emergency', requestedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'PF5', type: 'admission', patientName: 'P. Reddy', department: 'Emergency', status: 'pending', priority: 'emergency', requestedAt: new Date(Date.now() - 900000).toISOString() },
];

const mockWards: SuperintendentDashboardData['wards'] = [
  { id: 'W1', name: 'Ward 1A (Medicine)', totalBeds: 30, occupied: 26, reserved: 2, available: 2, occupancyPct: 87, pendingDischarges: 4, criticalPatients: 1, status: 'high' },
  { id: 'W2', name: 'Ward 2B (Surgery)', totalBeds: 24, occupied: 18, reserved: 1, available: 5, occupancyPct: 75, pendingDischarges: 6, criticalPatients: 0, status: 'normal' },
  { id: 'W3', name: 'Ward 3A (Medicine)', totalBeds: 28, occupied: 27, reserved: 1, available: 0, occupancyPct: 96, pendingDischarges: 8, criticalPatients: 2, status: 'full' },
  { id: 'W4', name: 'Ward 4 (Obstetrics)', totalBeds: 20, occupied: 14, reserved: 0, available: 6, occupancyPct: 70, pendingDischarges: 3, criticalPatients: 0, status: 'normal' },
  { id: 'W5', name: 'Ward 5 (Pediatrics)', totalBeds: 18, occupied: 11, reserved: 1, available: 6, occupancyPct: 61, pendingDischarges: 2, criticalPatients: 0, status: 'normal' },
];

const mockICUOT: SuperintendentDashboardData['icuOt'] = [
  { unit: 'Medical ICU', type: 'icu', totalCapacity: 12, inUse: 11, available: 1, waitingQueue: 2, criticalAlerts: 3, status: 'high_load' },
  { unit: 'Surgical ICU', type: 'icu', totalCapacity: 8, inUse: 7, available: 1, waitingQueue: 1, criticalAlerts: 1, status: 'high_load' },
  { unit: 'Neonatal ICU', type: 'icu', totalCapacity: 10, inUse: 6, available: 4, waitingQueue: 0, criticalAlerts: 0, status: 'available' },
  { unit: 'OT 1 (General)', type: 'ot', totalCapacity: 4, inUse: 3, available: 1, waitingQueue: 2, criticalAlerts: 0, status: 'high_load' },
  { unit: 'OT 2 (Cardiac)', type: 'ot', totalCapacity: 2, inUse: 2, available: 0, waitingQueue: 1, criticalAlerts: 1, status: 'full' },
];

const mockAlerts: SuperintendentDashboardData['alerts'] = [
  { id: 'A1', type: 'critical', category: 'ICU Capacity', message: 'Medical ICU at 92% — 2 patients in queue. Step-down transfer needed.', department: 'ICU', timestamp: new Date(Date.now() - 1800000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'critical', category: 'Patient Complaint', message: 'Critical patient grievance: family reports delay in emergency admission (>2hr wait).', department: 'Emergency', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'warning', category: 'Discharge Delay', message: '12 discharges delayed beyond 4 hours — billing and pharmacy bottlenecks identified.', timestamp: new Date(Date.now() - 7200000).toISOString(), actionRequired: true },
  { id: 'A4', type: 'warning', category: 'OT Delay', message: 'OT 2 running 45 mins behind schedule — cardiac surgery overrun.', department: 'OT', timestamp: new Date(Date.now() - 5400000).toISOString(), actionRequired: true },
];

const mockTasks: SuperintendentDashboardData['tasks'] = [
  { id: 'T1', title: 'Resolve Ward 3A bed crunch — expedite 8 pending discharges', priority: 'critical', assignedTo: 'Ward In-Charge', department: 'Medicine', status: 'in_progress', dueAt: new Date(Date.now() + 3600000).toISOString() },
  { id: 'T2', title: 'Arrange ICU step-down for 2 stable patients', priority: 'high', assignedTo: 'ICU Coordinator', department: 'ICU', status: 'pending', dueAt: new Date(Date.now() + 7200000).toISOString() },
  { id: 'T3', title: 'Follow up on patient complaint — emergency wait time', priority: 'critical', assignedTo: 'PRO', department: 'Emergency', status: 'pending', dueAt: new Date(Date.now() + 1800000).toISOString() },
  { id: 'T4', title: 'Reallocate on-call anesthesiologist for OT 2 backlog', priority: 'high', assignedTo: 'Duty Roster', department: 'OT', status: 'pending', dueAt: new Date(Date.now() + 5400000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const superintendentApi = {
  getDashboardSummary: async (filters: SuperFilters) => ({
    data: {
      kpis: mockKpis,
      patientFlow: mockPatientFlow,
      wards: mockWards,
      icuOt: mockICUOT,
      alerts: mockAlerts,
      tasks: mockTasks,
    } as SuperintendentDashboardData,
    message: 'Success',
    status: 200,
  }),

  resolveFlowItem: async (id: string) => ({ data: { success: true }, message: 'Resolved', status: 200 }),
  resolveAlert: async (id: string) => ({ data: { success: true }, message: 'Resolved', status: 200 }),
  completeTask: async (id: string) => ({ data: { success: true }, message: 'Completed', status: 200 }),
};
