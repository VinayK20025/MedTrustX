/**
 * MedTrustX — Dashboard Integration Hooks
 * ──────────────────────────────────────────────────
 * React Query hooks for the integrated dashboard,
 * replacing hardcoded data with real backend calls.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gatewayApi, type SystemHealthSummary, type DashboardSummary, type ActivityEvent, type SystemAlert, type ServiceHealthStatus } from '@/services/gateway';
import { apiGet } from '@/services/api';
import { QUERY_CONFIG } from '@/utils/constants';
import { useEventInvalidation, useEventBuffer } from '@/hooks/useEvents';
import type { PaginatedResponse } from '@/types/api.types';

/* ── Query Keys ──────────────────────────────────────── */

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  summary: () => [...DASHBOARD_KEYS.all, 'summary'] as const,
  health: () => [...DASHBOARD_KEYS.all, 'health'] as const,
  healthService: (name: string) => [...DASHBOARD_KEYS.health(), name] as const,
  activity: (limit?: number) => [...DASHBOARD_KEYS.all, 'activity', limit] as const,
  alerts: (filter?: string) => [...DASHBOARD_KEYS.all, 'alerts', filter] as const,
  stats: () => [...DASHBOARD_KEYS.all, 'stats'] as const,
  patientStats: () => [...DASHBOARD_KEYS.all, 'patient-stats'] as const,
  bedOccupancy: () => [...DASHBOARD_KEYS.all, 'bed-occupancy'] as const,
  revenueStats: () => [...DASHBOARD_KEYS.all, 'revenue'] as const,
};

/* ── System Health ──────────────────────────────────── */

/** Aggregate health across all microservices */
export function useSystemHealth() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.health(),
    queryFn: () => gatewayApi.getSystemHealth(),
    refetchInterval: 30_000, // Poll every 30s
    staleTime: 15_000,
  });
}

/** Individual service health check */
export function useServiceHealth(serviceName: string) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.healthService(serviceName),
    queryFn: () => gatewayApi.checkServiceHealth(serviceName),
    refetchInterval: 60_000,
    staleTime: 30_000,
    enabled: !!serviceName,
  });
}

/* ── Dashboard Summary ──────────────────────────────── */

/** Composed dashboard data from multiple services */
export function useDashboardSummary() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.summary(),
    queryFn: () => gatewayApi.getDashboardSummary(),
    refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL,
    staleTime: QUERY_CONFIG.STALE_TIME,
  });
}

/* ── Patient Statistics (from patient-service) ─────── */

interface PatientStats {
  totalActive: number;
  totalAdmitted: number;
  todayAdmissions: number;
  todayDischarges: number;
  criticalCount: number;
  changePercent: number;
}

export function usePatientStats() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.patientStats(),
    queryFn: async (): Promise<PatientStats> => {
      try {
        const response = await apiGet<{ data: PatientStats }>('/api/v1/patients/stats/summary');
        return response.data;
      } catch {
        // Fallback: compute from patient list
        try {
          const patients = await apiGet<PaginatedResponse<{ status: string }>>('/api/v1/patients', {
            params: { limit: 1, status: 'active' },
          });
          return {
            totalActive: patients.meta?.total ?? 0,
            totalAdmitted: 0,
            todayAdmissions: 0,
            todayDischarges: 0,
            criticalCount: 0,
            changePercent: 0,
          };
        } catch {
          return { totalActive: 0, totalAdmitted: 0, todayAdmissions: 0, todayDischarges: 0, criticalCount: 0, changePercent: 0 };
        }
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/* ── Appointment Statistics (from appointment-service) */

interface AppointmentStats {
  todayTotal: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  changePercent: number;
}

export function useAppointmentStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEYS.stats(), 'appointments'],
    queryFn: async (): Promise<AppointmentStats> => {
      try {
        const response = await apiGet<{ data: AppointmentStats }>('/api/v1/appointments/stats/today');
        return response.data;
      } catch {
        return { todayTotal: 0, completed: 0, upcoming: 0, cancelled: 0, changePercent: 0 };
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/* ── Bed Occupancy (from bed-management-service) ───── */

interface BedOccupancy {
  totalBeds: number;
  occupied: number;
  available: number;
  maintenance: number;
  occupancyRate: number;
  wards: { name: string; total: number; occupied: number }[];
}

export function useBedOccupancy() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.bedOccupancy(),
    queryFn: async (): Promise<BedOccupancy> => {
      try {
        const response = await apiGet<{ data: BedOccupancy }>('/api/v1/beds/occupancy/summary');
        return response.data;
      } catch {
        return { totalBeds: 0, occupied: 0, available: 0, maintenance: 0, occupancyRate: 0, wards: [] };
      }
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

/* ── Revenue Stats (from billing-service) ──────────── */

interface RevenueStats {
  todayRevenue: number;
  monthRevenue: number;
  pendingBills: number;
  collectionRate: number;
  changePercent: number;
  currency: string;
}

export function useRevenueStats() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.revenueStats(),
    queryFn: async (): Promise<RevenueStats> => {
      try {
        const response = await apiGet<{ data: RevenueStats }>('/api/v1/billing/revenue/summary');
        return response.data;
      } catch {
        return { todayRevenue: 0, monthRevenue: 0, pendingBills: 0, collectionRate: 0, changePercent: 0, currency: 'INR' };
      }
    },
    refetchInterval: 300_000,
    staleTime: 120_000,
  });
}

/* ── ER Statistics (from er-service) ───────────────── */

interface ERStats {
  activeCases: number;
  waitingCount: number;
  averageWaitMinutes: number;
  criticalCount: number;
  changePercent: number;
}

export function useERStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEYS.stats(), 'er'],
    queryFn: async (): Promise<ERStats> => {
      try {
        const response = await apiGet<{ data: ERStats }>('/api/v1/er/stats/current');
        return response.data;
      } catch {
        return { activeCases: 0, waitingCount: 0, averageWaitMinutes: 0, criticalCount: 0, changePercent: 0 };
      }
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

/* ── IoMT Device Stats (from devices-service) ──────── */

interface DeviceStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  alertingDevices: number;
  uptimePercent: number;
}

export function useDeviceStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEYS.stats(), 'devices'],
    queryFn: async (): Promise<DeviceStats> => {
      try {
        const response = await apiGet<{ data: DeviceStats }>('/api/v1/devices/stats/summary');
        return response.data;
      } catch {
        return { totalDevices: 0, onlineDevices: 0, offlineDevices: 0, alertingDevices: 0, uptimePercent: 0 };
      }
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/* ── ZTA Trust Score (from zta-service) ───────────── */

interface ZTAStats {
  trustScore: number;
  policyViolations: number;
  activeSessions: number;
  blockedAttempts: number;
  status: 'healthy' | 'warning' | 'critical';
}

export function useZTAStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEYS.stats(), 'zta'],
    queryFn: async (): Promise<ZTAStats> => {
      try {
        const response = await apiGet<{ data: ZTAStats }>('/api/v1/zta/trust/score');
        return response.data;
      } catch {
        return { trustScore: 0, policyViolations: 0, activeSessions: 0, blockedAttempts: 0, status: 'healthy' };
      }
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

/* ── Recent Activity (from gateway/event bus) ──────── */

export function useRecentActivity(limit = 20) {
  return useQuery({
    queryKey: DASHBOARD_KEYS.activity(limit),
    queryFn: () => gatewayApi.getRecentActivity(limit),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

/** Real-time activity via WebSocket */
export function useLiveActivity() {
  return useEventBuffer(
    { domains: ['patient', 'clinical', 'pharmacy', 'icu', 'ot', 'er', 'billing', 'security'] },
    50,
  );
}

/* ── System Alerts ──────────────────────────────────── */

export function useSystemAlerts() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.alerts('active'),
    queryFn: () => gatewayApi.getAlerts(false),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => gatewayApi.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.alerts() });
    },
  });
}

/* ── Auto-Invalidation on Real-time Events ────────── */

/** Auto-invalidate dashboard data when backend events arrive */
export function useDashboardEventSync() {
  // Invalidate patient stats on patient events
  useEventInvalidation(
    { domains: ['patient'], actions: ['CREATED', 'UPDATED', 'ADMITTED', 'DISCHARGED', 'DELETED'] },
    [DASHBOARD_KEYS.patientStats() as unknown as string[]],
  );

  // Invalidate bed data on bed events
  useEventInvalidation(
    { domains: ['bed', 'admission'], actions: ['CREATED', 'UPDATED', 'RELEASED'] },
    [DASHBOARD_KEYS.bedOccupancy() as unknown as string[]],
  );

  // Invalidate appointment data on appointment events
  useEventInvalidation(
    { domains: ['appointment'], actions: ['CREATED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'] },
    [[...DASHBOARD_KEYS.stats(), 'appointments'] as string[]],
  );

  // Invalidate alerts on security events
  useEventInvalidation(
    { domains: ['security', 'zta'], actions: ['ALERT', 'VIOLATION', 'BLOCKED'] },
    [DASHBOARD_KEYS.alerts() as unknown as string[]],
  );

  // Invalidate revenue on billing events
  useEventInvalidation(
    { domains: ['billing'], actions: ['CREATED', 'PAID', 'REFUNDED'] },
    [DASHBOARD_KEYS.revenueStats() as unknown as string[]],
  );
}
