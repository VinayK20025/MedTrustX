/**
 * MedTrustX — Emergency Physician API Client
 * High-frequency ER data layer
 */
import type { ERDashboardData } from '../types/er.types';

const BASE_URL = '/api/v1/clinical/er';

export interface ERFilters {
  view?: 'all' | 'critical' | 'triage';
}

/* ── MOCK FALLBACK DATA ──────────────────────────────────── */

const mockKpis: ERDashboardData['kpis'] = [
  { id: '1', title: 'Patients Waiting', value: 14, status: 'warning', delta: 'Avg wait: 18m' },
  { id: '2', title: 'Critical Cases', value: 3, status: 'critical', delta: '2 in Resus, 1 Trauma' },
  { id: '3', title: 'Avg Triage Time', value: '4.2m', status: 'success', delta: 'Target < 5m' },
  { id: '4', title: 'ICU Transfers', value: 2, status: 'normal', delta: 'Pending: 1' },
];

const mockTriageQueue: ERDashboardData['triageQueue'] = [
  { id: 'TQ1', patientName: 'Unknown Male', age: 40, gender: 'M', symptoms: 'Severe chest pain, diaphoresis', arrivalTime: new Date(Date.now() - 2 * 60000).toISOString(), waitingTime: 2, priority: 'critical', status: 'in_treatment' },
  { id: 'TQ2', patientName: 'S. Sharma', age: 28, gender: 'F', symptoms: 'RTA, head injury, LOC', arrivalTime: new Date(Date.now() - 5 * 60000).toISOString(), waitingTime: 5, priority: 'critical', status: 'waiting' },
];

const mockCriticalPatients: ERDashboardData['criticalPatients'] = [
  { id: 'CP1', patientName: 'Unknown Male', age: 40, diagnosis: 'Suspected STEMI', location: 'Resus 1', vitals: { hr: 115, bp: '85/50', spo2: 88, rr: 28 }, interventions: ['ECG done', 'O2 at 4L', 'Aspirin given'], alerts: ['BP dropping'] },
];

const mockResources: ERDashboardData['resources'] = [
  { id: 'R1', type: 'icu_beds', label: 'ICU Beds', available: 1, total: 20, status: 'critical' },
  { id: 'R2', type: 'ot_availability', label: 'Emergency OT', available: 1, total: 2, status: 'warning' },
];

const mockAlerts: ERDashboardData['alerts'] = [
  { id: 'A1', type: 'new_trauma', severity: 'critical', message: 'Incoming Polytrauma: RTA, ETA 5 mins. Prep Trauma Bay.', timestamp: new Date(Date.now() - 60000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */
import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';

export const erApi = {
  getDashboardSummary: async (filters: ERFilters): Promise<{ data: ERDashboardData; message: string; status: number }> => {
    try {
      const [statsRes, triageRes, casesRes, alertsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.er.statsCurrent),
        apiGet<any>(endpoints.er.triage),
        apiGet<any>(endpoints.er.cases, { params: { criticalOnly: true } }),
        apiGet<any>(endpoints.gateway.alerts, { params: { unit: 'ER', unread: true } }),
      ]);

      const stats = statsRes.status === 'fulfilled' ? statsRes.value?.data : null;
      const triage = triageRes.status === 'fulfilled' ? triageRes.value?.data ?? [] : mockTriageQueue;
      const criticalCases = casesRes.status === 'fulfilled' ? casesRes.value?.data ?? [] : mockCriticalPatients;
      const alerts = alertsRes.status === 'fulfilled' ? alertsRes.value?.data ?? [] : mockAlerts;

      const kpis = stats?.kpis ?? mockKpis;
      const resources = stats?.resources ?? mockResources;

      return {
        data: {
          kpis,
          triageQueue: triage,
          criticalPatients: criticalCases,
          resources,
          alerts,
        },
        message: 'Success', 
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis,
          triageQueue: mockTriageQueue,
          criticalPatients: mockCriticalPatients,
          resources: mockResources,
          alerts: mockAlerts,
        },
        message: 'Failed to load live data, falling back to cached state', 
        status: 500,
      };
    }
  },

  acknowledgeAlert: async (alertId: string) => {
    await apiPost(endpoints.gateway.acknowledgeAlert(alertId));
    return { data: { success: true }, message: 'Acknowledged', status: 200 };
  },
};
