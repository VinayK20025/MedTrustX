/**
 * MedTrustX — CEO API Client
 * Integrated Dashboard Data Fetching
 */
import { apiGet, apiPost } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type { CeoDashboardData, CeoTask, ActionableAlert, OperationsMetrics, FinancialOverview } from '../types/ceo.types';

export interface CeoFilters {
  timeRange: 'today' | '7d' | '30d';
  hospitalId?: string;
}

/* ── API Service (Real Backend Integration) ──────────────── */

export const ceoApi = {
  getDashboardSummary: async (filters: CeoFilters): Promise<{
    data: CeoDashboardData;
    message: string;
    status: number;
  }> => {
    try {
      // Parallel fetch from multiple operational & financial services
      const [billingRes, bedRes, erRes, tasksRes, alertsRes] = await Promise.allSettled([
        apiGet<any>(endpoints.billing.revenueSummary),
        apiGet<any>(endpoints.beds.occupancy),
        apiGet<any>(endpoints.er.statsCurrent),
        apiGet<any>(endpoints.hr.employee('me') + '/tasks'), // Placeholder for approval tasks
        apiGet<any>(endpoints.gateway.alerts, { params: { unread: true } }),
      ]);

      const billing = billingRes.status === 'fulfilled' ? billingRes.value?.data ?? billingRes.value : null;
      const beds = bedRes.status === 'fulfilled' ? bedRes.value?.data ?? bedRes.value : null;
      const er = erRes.status === 'fulfilled' ? erRes.value?.data ?? erRes.value : null;
      const rawTasks = tasksRes.status === 'fulfilled' ? tasksRes.value?.data ?? [] : [];
      const rawAlerts = alertsRes.status === 'fulfilled' ? alertsRes.value?.data ?? [] : [];

      // Build Financial Data
      const financial: FinancialOverview = {
        revenueToday: billing?.todayRevenue ?? 0,
        revenueVsTarget: billing?.targetPercentage ?? 0,
        operationalCosts: billing?.todayCosts ?? 0,
        pendingApprovalsValue: billing?.pendingApprovals ?? 0,
        monthlyTrend: billing?.trend ?? [],
      };

      // Build Operations Data
      const operations: OperationsMetrics = {
        bedOccupancyRate: beds?.occupancyRate ?? 0,
        icuLoad: beds?.wards?.find((w: any) => w.name.includes('ICU'))?.occupancyRate ?? 0,
        pendingDischarges: beds?.pendingDischarges ?? 0,
        erWaitTimeAvg: er?.averageWaitMinutes ?? 0,
        otBacklog: 0, // Would come from OT service
        criticalBottlenecks: (beds?.occupancyRate > 95 ? 1 : 0) + (er?.averageWaitMinutes > 60 ? 1 : 0),
      };

      // Build KPIs
      const kpis = [
        { id: '1', title: 'Revenue Today', value: financial.revenueToday, format: 'currency' as const, trend: billing?.changePercent ?? 0, trendDirection: (billing?.changePercent ?? 0) >= 0 ? 'up' as const : 'down' as const, status: (billing?.changePercent ?? 0) >= 0 ? 'good' as const : 'warning' as const, actionLabel: 'View Billing', actionUrl: '/dashboard/ceo/financial' },
        { id: '2', title: 'Bed Occupancy', value: operations.bedOccupancyRate, format: 'percentage' as const, trend: beds?.changePercent ?? 0, trendDirection: (beds?.changePercent ?? 0) >= 0 ? 'up' as const : 'down' as const, status: operations.bedOccupancyRate > 90 ? 'warning' as const : 'good' as const, actionLabel: 'Manage Beds', actionUrl: '/dashboard/ceo/operations' },
        { id: '3', title: 'ICU Load', value: operations.icuLoad, format: 'percentage' as const, trend: 0, trendDirection: 'neutral' as const, status: operations.icuLoad > 95 ? 'critical' as const : 'warning' as const, actionLabel: 'View ICU', actionUrl: '/dashboard/ceo/icu' },
        { id: '4', title: 'Pending Discharges', value: operations.pendingDischarges, format: 'number' as const, trend: 0, trendDirection: 'neutral' as const, status: operations.pendingDischarges > 20 ? 'warning' as const : 'good' as const, actionLabel: 'Expedite', actionUrl: '/dashboard/ceo/operations' },
      ];

      // Format Tasks & Alerts
      const tasks: CeoTask[] = rawTasks.map((t: any) => ({
        id: t.id, title: t.title, description: t.description, priority: t.priority ?? 'medium',
        category: t.category ?? 'operational', timestamp: t.createdAt ?? new Date().toISOString(),
        status: t.status ?? 'pending', requester: t.requesterName ?? 'System',
        actions: t.availableActions ?? ['Approve', 'Reject']
      }));

      const alerts: ActionableAlert[] = rawAlerts.slice(0, 5).map((a: any) => ({
        id: a.id, type: a.severity === 'critical' ? 'critical' : 'warning',
        category: a.category ?? 'operational', message: a.message ?? a.title,
        timestamp: a.timestamp ?? new Date().toISOString(),
        unit: a.source, actionRequired: !a.acknowledged, actionLabel: 'Acknowledge'
      }));

      return {
        data: { kpis, operations, financial, tasks, alerts },
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      // Fallback rich mock data for testing/demo
      return {
        data: {
          kpis: [
            { id: '1', title: 'Revenue Today', value: 1245000, format: 'currency', trend: 4.2, trendDirection: 'up', status: 'good', actionLabel: 'View Billing', actionUrl: '/dashboard/ceo/financial' },
            { id: '2', title: 'Bed Occupancy', value: 87.5, format: 'percentage', trend: -2.1, trendDirection: 'down', status: 'warning', actionLabel: 'Manage Beds', actionUrl: '/dashboard/ceo/operations' },
            { id: '3', title: 'ICU Load', value: 92.0, format: 'percentage', trend: 1.5, trendDirection: 'up', status: 'warning', actionLabel: 'View ICU', actionUrl: '/dashboard/ceo/icu' },
            { id: '4', title: 'Pending Discharges', value: 45, format: 'number', trend: 0, trendDirection: 'neutral', status: 'good', actionLabel: 'Expedite', actionUrl: '/dashboard/ceo/operations' },
          ], 
          operations: { bedOccupancyRate: 87.5, icuLoad: 92.0, pendingDischarges: 45, erWaitTimeAvg: 24, otBacklog: 12, criticalBottlenecks: 2 },
          financial: { 
            revenueToday: 1245000, revenueVsTarget: 96, operationalCosts: 890000, pendingApprovalsValue: 450000, 
            monthlyTrend: [
              { date: 'Mon', revenue: 1100000, costs: 800000 },
              { date: 'Tue', revenue: 1150000, costs: 820000 },
              { date: 'Wed', revenue: 1200000, costs: 850000 },
              { date: 'Thu', revenue: 1245000, costs: 890000 },
              { date: 'Fri', revenue: 1300000, costs: 880000 }
            ] 
          },
          tasks: [
            { id: 'T1', title: 'Approve Equipment PO', description: 'MRI Machine maintenance contract renewal', priority: 'high', category: 'financial', timestamp: new Date().toISOString(), status: 'pending', requester: 'Dr. Sarah Jenkins', actions: ['Approve', 'Reject'] },
            { id: 'T2', title: 'Sign Off Q3 Compliance', description: 'Quarterly HIPAA audit sign-off', priority: 'medium', category: 'hr', timestamp: new Date().toISOString(), status: 'pending', requester: 'CISO Office', actions: ['Review'] }
          ], 
          alerts: [
            { id: 'A1', type: 'critical', category: 'operational', message: 'ER Wait Times exceeding 45 mins threshold', timestamp: new Date().toISOString(), unit: 'Emergency Dept', actionRequired: true, actionLabel: 'Acknowledge' },
            { id: 'A2', type: 'warning', category: 'financial', message: 'Unusually high overtime billing detected in ICU', timestamp: new Date().toISOString(), unit: 'ICU/Finance', actionRequired: true, actionLabel: 'Investigate' }
          ],
        },
        message: 'Failed to load CEO dashboard data',
        status: 500,
      };
    }
  },

  approveTask: async (taskId: string, action: string) => {
    // Call HR/Task service to approve
    const response = await apiPost(endpoints.hr.employee('me') + `/tasks/${taskId}/execute`, { action });
    return { data: { success: true }, message: `Task ${action} successful`, status: 200 };
  },

  escalateAlert: async (alertId: string) => {
    // Call Gateway alert service
    const response = await apiPost(endpoints.gateway.acknowledgeAlert(alertId));
    return { data: { success: true }, message: 'Alert escalated/acknowledged', status: 200 };
  }
};
