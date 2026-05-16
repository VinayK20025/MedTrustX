/**
 * MedTrustX — Staff Nurse API Client
 * Task-driven API for exact and safe clinical execution
 */
import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type { NurseDashboardData, NurseTask, NurseAlert, NursePatient } from '../types/nurse.types';

export interface NurseFilters {
  patientId?: string;
  wardId?: string;
}

/* ── API Service (Real Backend Integration) ──────────────── */

export const nurseApi = {
  getDashboardSummary: async (filters: NurseFilters): Promise<{
    data: NurseDashboardData;
    message: string;
    status: number;
  }> => {
    try {
      // Parallel fetch: Assigned patients, active nursing tasks, and ward alerts
      const [patientsRes, tasksRes, alertsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.patients.list, { 
          params: { status: 'admitted', ward: filters.wardId, limit: 20 } 
        }),
        apiGet<any>(endpoints.nursing.tasks, {
          params: { status: 'pending', limit: 50, ward: filters.wardId }
        }),
        apiGet<any>(endpoints.gateway.alerts, {
          params: { unread: true, source: filters.wardId }
        }),
      ]);

      const rawPatients = patientsRes.status === 'fulfilled' ? patientsRes.value?.data ?? [] : [];
      const rawTasks = tasksRes.status === 'fulfilled' ? tasksRes.value?.data ?? [] : [];
      const rawAlerts = alertsRes.status === 'fulfilled' ? alertsRes.value?.data ?? [] : [];

      // Transform Patients
      const patients: NursePatient[] = rawPatients.map((p: any) => ({
        id: p.id,
        name: p.fullName ?? `${p.firstName} ${p.lastName}`,
        bed: p.bed ?? 'Unassigned',
        status: mapStatus(p.status ?? 'stable'),
        nextTaskTime: p.nextTaskTime ?? 'None',
        alerts: p.alertCount ?? 0,
      }));

      // Transform Tasks
      const tasks: NurseTask[] = rawTasks.map((t: any) => ({
        id: t.id,
        title: t.title ?? t.description ?? 'Nursing Task',
        type: t.category ?? 'care',
        patientId: t.patientId ?? 'unknown',
        patientName: t.patientName ?? 'Unknown Patient',
        bed: t.bed ?? 'Unknown',
        status: t.status ?? 'pending',
        time: t.dueAt ?? t.scheduledFor ?? new Date().toISOString(),
        priority: t.priority ?? 'medium',
        requiresValidation: t.requiresValidation ?? false,
      }));

      // Transform Alerts
      const alerts: NurseAlert[] = rawAlerts.filter((a: any) => a.category === 'clinical' || a.category === 'nursing').map((a: any) => ({
        id: a.id,
        type: a.subCategory ?? 'safety',
        message: a.message ?? a.title,
        patientId: a.entityId ?? 'unknown',
        patientName: a.patientName ?? 'Unknown Patient',
        bed: a.bed ?? 'Unknown',
        priority: a.severity === 'critical' ? 'high' : 'medium',
      }));

      // Build KPIs
      const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;
      const completedTasksCount = rawTasks.filter((t: any) => t.status === 'completed').length;
      
      const kpis = [
        { id: '1', title: 'Pending Tasks', value: pendingTasksCount, status: pendingTasksCount > 10 ? 'warning' as const : 'normal' as const, delta: pendingTasksCount > 0 ? 'Next due soon' : 'All clear' },
        { id: '2', title: 'My Patients', value: patients.length, status: 'normal' as const, delta: filters.wardId ? `Ward ${filters.wardId}` : 'Assigned' },
        { id: '3', title: 'Completed Tasks', value: completedTasksCount, status: 'success' as const, delta: 'This shift' },
      ];

      return {
        data: { kpis, patients, tasks, alerts },
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      // Fallback
      return {
        data: { kpis: [], patients: [], tasks: [], alerts: [] },
        message: 'Failed to load nursing dashboard',
        status: 500,
      };
    }
  },

  completeTask: async (taskId: string, notes?: string) => {
    const response = await apiPost<any>(endpoints.nursing.task(taskId) + '/complete', { notes });
    return { data: response.data ?? response, message: 'Task marked complete', status: 200 };
  },

  recordVitals: async (patientId: string, vitals: any) => {
    const response = await apiPost<any>(endpoints.clinical.vitals(patientId), vitals);
    return { data: response.data ?? response, message: 'Vitals recorded successfully', status: 200 };
  }
};

/* ── Helpers ─────────────────────────────────────────── */

function mapStatus(status: string): 'stable' | 'observation' | 'critical' {
  if (['critical', 'emergency'].includes(status.toLowerCase())) return 'critical';
  if (['observation', 'admitted', 'monitoring'].includes(status.toLowerCase())) return 'observation';
  return 'stable';
}
