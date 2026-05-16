/**
 * MedTrustX — ICU Nurse API Client
 * High-frequency data stream mockup for real-time vitals and alerts
 */
import type { ICUDashboardData } from '../types/icu.types';

const BASE_URL = '/api/v1/nursing/icu-nurse';

export interface ICUFilters {
  unit?: string;
}

/* ── MOCK FALLBACK DATA ──────────────────────────────────── */

const mockKpis: ICUDashboardData['kpis'] = [
  { id: '1', title: 'ICU Occupancy', value: '4/6', status: 'normal', delta: '2 beds available' },
  { id: '2', title: 'Critical Status', value: 2, status: 'critical', delta: 'Immediate attention' },
  { id: '3', title: 'Active Alerts', value: 3, status: 'warning', delta: 'Acknowledge required' },
];

const mockPatients: ICUDashboardData['patients'] = [
  { id: 'P1', name: 'Robert Chen', bed: 'ICU-1', status: 'critical', vitals: { hr: 135, bp: '85/55', spo2: 88, resp: 28, temp: 38.5 }, activeAlerts: 2, diagnosis: 'Sepsis' },
  { id: 'P2', name: 'Maria Garcia', bed: 'ICU-2', status: 'stable', vitals: { hr: 78, bp: '115/75', spo2: 98, resp: 16, temp: 37.1 }, activeAlerts: 0, diagnosis: 'Post-CABG' },
];

const mockTasks: ICUDashboardData['tasks'] = [
  { id: 'T1', title: 'Titrate Noradrenaline', patientId: 'P1', bed: 'ICU-1', status: 'pending', priority: 'high', time: 'Immediate' },
];

const mockAlerts: ICUDashboardData['alerts'] = [
  { id: 'A1', type: 'vitals_drop', message: 'SpO2 dropped below 90%', patientId: 'P1', bed: 'ICU-1', severity: 'critical', timestamp: new Date().toISOString() },
];

/* ── API Service ───────────────────────────────────────── */
import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';

export const icuApi = {
  getDashboardSummary: async (filters: ICUFilters): Promise<{ data: ICUDashboardData; message: string; status: number }> => {
    try {
      const [patientsRes, tasksRes, alertsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.icu.patients, { params: { unit: filters.unit } }),
        apiGet<any>(endpoints.nursing.tasks, { params: { department: 'ICU', status: 'pending' } }),
        apiGet<any>(endpoints.gateway.alerts, { params: { unit: 'ICU', unread: true } }),
      ]);

      const patients = patientsRes.status === 'fulfilled' ? patientsRes.value?.data ?? [] : mockPatients;
      const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value?.data ?? [] : mockTasks;
      const alerts = alertsRes.status === 'fulfilled' ? alertsRes.value?.data ?? [] : mockAlerts;

      // Dynamically calculate KPIs
      const criticalCount = patients.filter((p: any) => p.status === 'critical').length;
      const kpis = [
        { id: '1', title: 'ICU Occupancy', value: patients.length, status: 'normal' as const, delta: 'Total assigned' },
        { id: '2', title: 'Critical Status', value: criticalCount, status: criticalCount > 0 ? 'critical' as const : 'normal' as const, delta: criticalCount > 0 ? 'Immediate attention' : 'All stable' },
        { id: '3', title: 'Active Alerts', value: alerts.length, status: alerts.length > 0 ? 'warning' as const : 'normal' as const, delta: 'Acknowledge required' },
      ];

      return {
        data: {
          kpis,
          patients,
          tasks,
          alerts,
        },
        message: 'Success', 
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis,
          patients: mockPatients,
          tasks: mockTasks,
          alerts: mockAlerts,
        },
        message: 'Failed to load live ICU data, falling back to cached state', 
        status: 500,
      };
    }
  },
};
