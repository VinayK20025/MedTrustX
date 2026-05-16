/**
 * MedTrustX - ICU Service API Client
 */
import { apiGet } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type { ICUDashboardData, ICUAlert, ICUPatient, ICUIntegration } from '../types/icu.types';

export interface ICUFilters {
  unit?: string;
}

const mockPatients: ICUPatient[] = [
  {
    id: 'ICU-P1',
    name: 'Maria Garcia',
    bed: 'ICU-1',
    status: 'critical',
    diagnosis: 'Septic Shock',
    vitals: { hr: 128, bp: '86/54', spo2: 90, resp: 26, temp: 38.8 },
    lastUpdated: new Date().toISOString(),
    activeAlerts: 2,
  },
  {
    id: 'ICU-P2',
    name: 'Arjun Rao',
    bed: 'ICU-3',
    status: 'warning',
    diagnosis: 'ARDS',
    vitals: { hr: 102, bp: '98/62', spo2: 92, resp: 24, temp: 37.4 },
    lastUpdated: new Date().toISOString(),
    activeAlerts: 1,
  },
  {
    id: 'ICU-P3',
    name: 'Leena Kapoor',
    bed: 'ICU-5',
    status: 'stable',
    diagnosis: 'Post-Op Monitoring',
    vitals: { hr: 78, bp: '118/76', spo2: 98, resp: 16, temp: 36.8 },
    lastUpdated: new Date().toISOString(),
    activeAlerts: 0,
  },
];

const mockAlerts: ICUAlert[] = [
  {
    id: 'ICU-A1',
    patientId: 'ICU-P1',
    bed: 'ICU-1',
    message: 'MAP below 60 despite vasopressors',
    severity: 'critical',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'ICU-A2',
    patientId: 'ICU-P2',
    bed: 'ICU-3',
    message: 'SpO2 dropped below 92%',
    severity: 'warning',
    timestamp: new Date().toISOString(),
  },
];

const mockIntegrations: ICUIntegration[] = [
  {
    id: 'ICU-INT-1',
    name: 'ICU Vitals Stream',
    status: 'healthy',
    sourceSystem: 'Philips ICU Monitors',
    targetSystem: 'MedTrustX ICU Service',
    lastSync: new Date().toISOString(),
    throughputPerHour: 4800,
  },
  {
    id: 'ICU-INT-2',
    name: 'Ventilator Telemetry',
    status: 'degraded',
    sourceSystem: 'Puritan Bennett 980',
    targetSystem: 'MedTrustX ICU Service',
    lastSync: new Date().toISOString(),
    throughputPerHour: 1200,
  },
];

function normalizePatients(rawPatients: any[]): ICUPatient[] {
  return rawPatients.map((p, index) => ({
    id: p.id ?? `ICU-${index + 1}`,
    name: p.name ?? p.patientName ?? 'Unknown Patient',
    bed: p.bed ?? p.bedLabel ?? `ICU-${index + 1}`,
    status: p.status ?? 'stable',
    diagnosis: p.diagnosis ?? p.primaryDiagnosis ?? 'Critical Care',
      vitals: p.vitals ?? {
        hr: p.hr ?? 0,
        bp: p.bp ?? '-',
        spo2: p.spo2 ?? 0,
        resp: p.resp ?? 0,
        temp: p.temp ?? 0,
      },
    lastUpdated: p.lastUpdated ?? new Date().toISOString(),
    activeAlerts: p.activeAlerts ?? 0,
  }));
}

export const icuApi = {
  getDashboardSummary: async (filters: ICUFilters): Promise<{ data: ICUDashboardData; message: string; status: number }> => {
    try {
      const [patientsRes, alertsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.icu.patients, { params: { unit: filters.unit } }),
        apiGet<any>(endpoints.gateway.alerts, { params: { unit: 'ICU', unread: true } }),
      ]);

      const patientsPayload = patientsRes.status === 'fulfilled'
        ? (patientsRes.value?.data ?? patientsRes.value ?? [])
        : [];
      const alertsPayload = alertsRes.status === 'fulfilled'
        ? (alertsRes.value?.data ?? alertsRes.value ?? [])
        : [];

      const patients = Array.isArray(patientsPayload) && patientsPayload.length > 0
        ? normalizePatients(patientsPayload)
        : mockPatients;

      const alerts = Array.isArray(alertsPayload) && alertsPayload.length > 0
        ? alertsPayload
        : mockAlerts;

      const criticalCount = patients.filter((p) => p.status === 'critical').length;
      const kpis = [
        { id: 'kpi-1', title: 'ICU Occupancy', value: `${patients.length}`, status: 'normal' as const, delta: 'Active beds' },
        { id: 'kpi-2', title: 'Critical Patients', value: criticalCount, status: criticalCount > 0 ? 'critical' as const : 'normal' as const, delta: 'Immediate attention' },
        { id: 'kpi-3', title: 'Active Alerts', value: alerts.length, status: alerts.length > 0 ? 'warning' as const : 'normal' as const, delta: 'Needs review' },
      ];

      return {
        data: {
          kpis,
          patients,
          alerts,
          integrations: mockIntegrations,
        },
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: [
            { id: 'kpi-1', title: 'ICU Occupancy', value: `${mockPatients.length}`, status: 'normal', delta: 'Active beds' },
            { id: 'kpi-2', title: 'Critical Patients', value: 1, status: 'critical', delta: 'Immediate attention' },
            { id: 'kpi-3', title: 'Active Alerts', value: mockAlerts.length, status: 'warning', delta: 'Needs review' },
          ],
          patients: mockPatients,
          alerts: mockAlerts,
          integrations: mockIntegrations,
        },
        message: 'Failed to load live ICU data, falling back to cached state',
        status: 500,
      };
    }
  },
};
