/**
 * MedTrustX — Nursing Superintendent API Client
 * Hospital-wide nursing workforce orchestration data
 */
import type { NursingSuperintendentData } from '../types/nursing.types';

const BASE_URL = '/api/v1/nursing/superintendent';

export interface NursingFilters {
  shift?: string;
  ward?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: NursingSuperintendentData['kpis'] = [
  { id: '1', title: 'On Duty Nurses', value: 142, status: 'normal', delta: 'Morning Shift' },
  { id: '2', title: 'Staffing Shortages', value: 3, status: 'critical', delta: 'ICU & Gen Med' },
  { id: '3', title: 'Task Completion', value: '94%', status: 'success', delta: 'Across all wards' },
];

const mockStaff: NursingSuperintendentData['staff'] = [
  { id: 'N1', name: 'N. Sharma', role: 'ICU Nurse', shift: 'Morning', status: 'active', currentWard: 'ICU-A' },
  { id: 'N2', name: 'J. Doe', role: 'Ward Nurse', shift: 'Morning', status: 'break', currentWard: 'Gen Med' },
  { id: 'N3', name: 'A. Patel', role: 'ER Nurse', shift: 'Morning', status: 'active', currentWard: 'ER' },
  { id: 'N4', name: 'S. Lee', role: 'Ward In-Charge', shift: 'Off', status: 'absent' },
];

const mockCoverage: NursingSuperintendentData['coverage'] = [
  { id: 'W1', wardName: 'ICU-A', nursesRequired: 12, nursesAssigned: 10, status: 'shortage', patientLoad: 12 },
  { id: 'W2', wardName: 'Gen Med', nursesRequired: 15, nursesAssigned: 15, status: 'optimal', patientLoad: 45 },
  { id: 'W3', wardName: 'Pediatrics', nursesRequired: 8, nursesAssigned: 6, status: 'critical_shortage', patientLoad: 20 },
];

const mockSchedules: NursingSuperintendentData['schedules'] = [
  { id: 'S1', nurseId: 'N1', nurseName: 'N. Sharma', date: new Date().toISOString().split('T')[0], shiftType: 'Morning', wardId: 'W1', status: 'scheduled' },
  { id: 'S2', nurseId: 'N2', nurseName: 'J. Doe', date: new Date().toISOString().split('T')[0], shiftType: 'Evening', wardId: 'W2', status: 'scheduled' },
];

const mockAlerts: NursingSuperintendentData['alerts'] = [
  { id: 'A1', type: 'staff_shortage', message: 'Pediatrics ward is down by 2 nurses. High patient load.', location: 'Pediatrics', severity: 'critical', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'A2', type: 'task_delay', message: 'Morning medication administration delayed by >30 mins.', location: 'Gen Med', severity: 'warning', timestamp: new Date(Date.now() - 1200000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const nursingApi = {
  getDashboardSummary: async (filters: NursingFilters) => ({
    data: {
      kpis: mockKpis,
      staff: mockStaff,
      coverage: mockCoverage,
      schedules: mockSchedules,
      alerts: mockAlerts,
    } as NursingSuperintendentData,
    message: 'Success', status: 200,
  }),
};
