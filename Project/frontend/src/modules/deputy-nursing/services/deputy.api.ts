/**
 * MedTrustX — Deputy Nursing Superintendent API Client
 * Fast, real-time data for staffing execution
 */
import type { DeputyDashboardData } from '../types/deputy.types';

const BASE_URL = '/api/v1/nursing/deputy';

export interface DeputyFilters {
  ward?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: DeputyDashboardData['kpis'] = [
  { id: '1', title: 'Available Reserve', value: 8, status: 'warning', delta: 'Currently free' },
  { id: '2', title: 'Coverage Gaps', value: 2, status: 'critical', delta: 'Requires action' },
  { id: '3', title: 'Delayed Tasks', value: 12, status: 'warning', delta: 'Across 3 wards' },
];

const mockStaff: DeputyDashboardData['availableStaff'] = [
  { id: 'N5', name: 'R. Gupta', role: 'Nurse', status: 'free', currentLocation: 'Staff Room' },
  { id: 'N6', name: 'T. Williams', role: 'ICU Nurse', status: 'assigned', currentLocation: 'ICU-B' },
  { id: 'N7', name: 'M. Ali', role: 'Senior Nurse', status: 'busy', currentLocation: 'Gen Med' },
];

const mockGaps: DeputyDashboardData['coverageGaps'] = [
  { id: 'G1', wardId: 'W3', wardName: 'Pediatrics', shortageCount: 2, criticality: 'high', suggestedStaffIds: ['N5'] },
  { id: 'G2', wardId: 'W1', wardName: 'ICU-A', shortageCount: 1, criticality: 'medium', suggestedStaffIds: [] },
];

const mockUpdates: DeputyDashboardData['shiftUpdates'] = [
  { id: 'U1', nurseName: 'K. Smith', action: 'reassigned', fromWard: 'Gen Med', toWard: 'Pediatrics', time: '10:15 AM' },
  { id: 'U2', nurseName: 'L. Chen', action: 'extended', toWard: 'ICU-A', time: '10:05 AM' },
];

const mockAlerts: DeputyDashboardData['alerts'] = [
  { id: 'A1', type: 'shortage', message: 'Pediatrics falls below critical ratio.', priority: 'high', ward: 'Pediatrics' },
  { id: 'A2', type: 'delay', message: 'Vitals collection delayed > 1hr', priority: 'medium', ward: 'Gen Med' },
];

/* ── API Service ───────────────────────────────────────── */

export const deputyApi = {
  getDashboardSummary: async (filters: DeputyFilters) => ({
    data: {
      kpis: mockKpis,
      availableStaff: mockStaff,
      coverageGaps: mockGaps,
      shiftUpdates: mockUpdates,
      alerts: mockAlerts,
    } as DeputyDashboardData,
    message: 'Success', status: 200,
  }),
};
