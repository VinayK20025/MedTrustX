/**
 * MedTrustX — Doctor API Client
 * Patient-centric Clinical data layer
 * ──────────────────────────────────────────────────
 * Integrates with:
 *   • patient-service  → Patient demographics & list
 *   • clinical-service → Clinical notes, vitals, orders
 *   • pharmacy-service → Prescriptions
 *   • appointment-service → Schedule & appointments
 *   • icu-service → ICU case data
 *   • diagnostics-service → Lab results
 *   • notification-service → Alerts
 */
import { apiGet, apiPost, apiPut } from '@/services/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { DoctorDashboardData, PatientDetailData } from '../types/doctor.types';

export interface DoctorFilters {
  view?: 'opd' | 'ipd' | 'all';
  period?: 'today' | '7d';
}

/* ── API Service (real backend integration) ──────────── */

export const doctorApi = {
  /** Get aggregated dashboard data for the doctor view */
  getDashboardSummary: async (filters: DoctorFilters): Promise<{
    data: DoctorDashboardData;
    message: string;
    status: number;
  }> => {
    try {
      // Parallel fetch from multiple services
      const [patientsRes, appointmentsRes, alertsRes] = await Promise.allSettled([
        apiGet<PaginatedResponse<any>>('/api/v1/patients', {
          params: {
            status: filters.view === 'opd' ? 'active' : filters.view === 'ipd' ? 'admitted' : undefined,
            limit: 20,
          },
        }),
        apiGet<any>('/api/v1/appointments', {
          params: { period: filters.period ?? 'today', limit: 10 },
        }),
        apiGet<any>('/api/v1/notifications', {
          params: { type: 'clinical', unread: true, limit: 10 },
        }),
      ]);

      // Transform patient data
      const patients = patientsRes.status === 'fulfilled'
        ? (patientsRes.value?.data ?? []).map((p: any) => ({
            id: p.id,
            name: p.fullName ?? `${p.firstName} ${p.lastName}`,
            age: p.age ?? calculateAge(p.dateOfBirth),
            gender: (p.gender ?? 'unknown').charAt(0).toUpperCase(),
            type: p.status === 'admitted' ? 'ipd' as const : 'opd' as const,
            ward: p.ward,
            bed: p.bed,
            diagnosis: p.primaryDiagnosis ?? 'Pending',
            status: mapPatientStatus(p.status),
            admittedAt: p.admittedAt ?? p.createdAt,
            lastUpdated: p.updatedAt,
            pendingActions: p.pendingActions ?? 0,
            allergies: p.allergies ?? [],
          }))
        : [];

      // Transform appointment data
      const appointments = appointmentsRes.status === 'fulfilled'
        ? ((appointmentsRes.value?.data ?? appointmentsRes.value) ?? []).map((a: any) => ({
            id: a.id,
            patientName: a.patientName ?? a.patient?.fullName ?? 'Unknown',
            type: a.type ?? 'opd',
            time: a.scheduledTime ?? a.time ?? '',
            status: a.status ?? 'scheduled',
          }))
        : [];

      // Transform alerts
      const alerts = alertsRes.status === 'fulfilled'
        ? ((alertsRes.value?.data ?? alertsRes.value) ?? []).map((n: any) => ({
            id: n.id,
            type: n.category ?? 'info',
            severity: n.severity ?? n.priority ?? 'info',
            message: n.message ?? n.body ?? '',
            patientName: n.patientName ?? '',
            timestamp: n.createdAt ?? n.timestamp ?? new Date().toISOString(),
          }))
        : [];

      // Build KPIs from fetched data
      const ipdCount = patients.filter((p: any) => p.type === 'ipd').length;
      const opdCount = patients.filter((p: any) => p.type === 'opd').length;
      const criticalCount = patients.filter((p: any) => p.status === 'critical').length;

      const kpis = [
        { id: '1', title: 'Patients Today', value: patients.length, status: 'normal' as const, delta: `${opdCount} OPD • ${ipdCount} IPD` },
        { id: '2', title: 'Pending Tasks', value: patients.reduce((sum: number, p: any) => sum + (p.pendingActions ?? 0), 0), status: 'warning' as const, delta: 'tasks remaining' },
        { id: '3', title: 'Critical Cases', value: criticalCount, status: criticalCount > 0 ? 'critical' as const : 'normal' as const, delta: criticalCount > 0 ? 'requires attention' : 'none' },
        { id: '4', title: 'Completed', value: appointments.filter((a: any) => a.status === 'completed').length, status: 'normal' as const, delta: 'today' },
      ];

      return {
        data: {
          kpis,
          patients,
          appointments,
          alerts,
          recentTimeline: [], // Will be populated from clinical-service timeline endpoint
        },
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      // Return empty state on total failure
      return {
        data: { kpis: [], patients: [], appointments: [], alerts: [], recentTimeline: [] },
        message: 'Failed to load dashboard data',
        status: 500,
      };
    }
  },

  /** Get patient detail from patient-service + clinical-service */
  getPatientDetail: async (patientId: string): Promise<PatientDetailData | null> => {
    try {
      const [patient, clinical, vitals] = await Promise.allSettled([
        apiGet<ApiResponse<any>>(`/api/v1/patients/${patientId}`),
        apiGet<any>(`/api/v1/clinical/patients/${patientId}/summary`),
        apiGet<any>(`/api/v1/clinical/patients/${patientId}/vitals/latest`),
      ]);

      if (patient.status === 'rejected') return null;

      const p = patient.value?.data ?? patient.value;
      return {
        ...p,
        clinicalSummary: clinical.status === 'fulfilled' ? clinical.value?.data ?? clinical.value : null,
        latestVitals: vitals.status === 'fulfilled' ? vitals.value?.data ?? vitals.value : null,
      };
    } catch {
      return null;
    }
  },

  /** Get patient timeline from clinical-service */
  getPatientTimeline: async (patientId: string) => {
    try {
      const response = await apiGet<any>(`/api/v1/clinical/patients/${patientId}/timeline`);
      return response?.data ?? response ?? [];
    } catch {
      return [];
    }
  },

  /** Add clinical note via clinical-service */
  addNote: async (patientId: string, note: string) => {
    const response = await apiPost<any>(`/api/v1/clinical/patients/${patientId}/notes`, {
      content: note,
      type: 'progress_note',
    });
    return { data: { success: true }, message: 'Note saved', status: 200 };
  },

  /** Create prescription via pharmacy-service */
  prescribe: async (patientId: string, rx: any) => {
    const response = await apiPost<any>(`/api/v1/pharmacy/prescriptions`, {
      patientId,
      ...rx,
    });
    return { data: { success: true }, message: 'Prescribed', status: 200 };
  },

  /** Place clinical order via order-service */
  placeOrder: async (patientId: string, order: { type: string; details: any }) => {
    const response = await apiPost<any>(`/api/v1/orders`, {
      patientId,
      orderType: order.type,
      ...order.details,
    });
    return { data: { success: true }, message: 'Order placed', status: 200 };
  },

  /** Get lab results from diagnostics-service */
  getLabResults: async (patientId: string) => {
    try {
      const response = await apiGet<any>(`/api/v1/diagnostics/patients/${patientId}/results`);
      return response?.data ?? response ?? [];
    } catch {
      return [];
    }
  },
};

/* ── Helpers ─────────────────────────────────────────── */

function calculateAge(dob: string | null): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function mapPatientStatus(status: string): string {
  const map: Record<string, string> = {
    active: 'stable',
    admitted: 'active',
    critical: 'critical',
    discharged: 'discharge_ready',
    deceased: 'deceased',
  };
  return map[status] ?? status;
}
