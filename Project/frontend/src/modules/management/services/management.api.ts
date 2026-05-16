import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api';
import { autoEndpoints } from '@/services/autoEndpoints';
import type { ManagementDashboardData, ManagementTask, ManagementRoute } from '../types/management.types';

export interface ManagementFilters {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

const mockDashboard: ManagementDashboardData = {
  kpis: [
    { id: '1', title: 'Open Tasks', value: 14, status: 'warning', delta: '4 urgent' },
    { id: '2', title: 'Active Routes', value: 9, status: 'success', delta: 'all live' },
    { id: '3', title: 'Blocked Work', value: 3, status: 'critical', delta: 'needs escalation' },
    { id: '4', title: 'Resolved Today', value: 26, status: 'normal', delta: 'cross-functional' },
  ],
  workItems: [
    { id: 'MG-001', title: 'Approve ward staffing override', category: 'Operations', owner: 'Hospital Admin', priority: 'high', status: 'open', updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), route: '/dashboard/hod/staff', tags: ['staffing', 'override'], description: 'Approve the staffing variance for the night shift and notify the ward office.' },
    { id: 'MG-002', title: 'Review critical visitor access exception', category: 'Security', owner: 'Security Officer', priority: 'critical', status: 'blocked', updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), route: '/dashboard/visitor-management/visits', tags: ['access', 'security'], description: 'Escalated exception for after-hours visitor clearance.' },
    { id: 'MG-003', title: 'Validate case handoff routing', category: 'Clinical Governance', owner: 'Department Head', priority: 'medium', status: 'in_progress', updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), route: '/dashboard/case-management', tags: ['handoff', 'clinical'], description: 'Confirm case routing rules and referral ownership across services.' },
    { id: 'MG-004', title: 'Confirm network topology exception', category: 'Infrastructure', owner: 'IT Ops', priority: 'high', status: 'monitoring', updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), route: '/dashboard/network-management/topology', tags: ['network', 'routing'], description: 'A topology exception needs validation before release to production.' },
  ],
  routes: [
    { id: 'MR-001', name: 'Case Management Escalation', source: 'Case Management', destination: 'HOD + Super Admin', condition: 'High-priority case or discharge block', active: true, throughputPerHour: 28, latencyMs: 210, status: 'healthy' },
    { id: 'MR-002', name: 'Evidence Hold Routing', source: 'Evidence Management', destination: 'Legal + Compliance', condition: 'New evidence item or chain-of-custody event', active: true, throughputPerHour: 14, latencyMs: 340, status: 'healthy' },
    { id: 'MR-003', name: 'Visitor Access Exception', source: 'Visitor Management', destination: 'Security + Front Desk', condition: 'Denied badge or unusual visit pattern', active: true, throughputPerHour: 9, latencyMs: 180, status: 'healthy' },
    { id: 'MR-004', name: 'Network Fault Escalation', source: 'Network Management', destination: 'IT Ops + Engineering', condition: 'Device down or degraded network segment', active: true, throughputPerHour: 32, latencyMs: 145, status: 'degraded' },
  ],
  operationalPanels: [
    { id: 'OP-001', name: 'Case Management', subtitle: 'Care workflows', href: '/dashboard/case-management', status: 'healthy', count: 12, description: 'Patient lifecycle optimization, discharge planning, and task coordination.' },
    { id: 'OP-002', name: 'Legal Case Management', subtitle: 'Compliance casebook', href: '/dashboard/legal-case-management', status: 'healthy', count: 6, description: 'Legal workstream tracking and case documentation.' },
    { id: 'OP-003', name: 'Evidence Management', subtitle: 'Audit support', href: '/dashboard/evidence-management', status: 'watch', count: 4, description: 'Chain-of-custody and metadata management for audit-ready evidence.' },
    { id: 'OP-004', name: 'Network Management', subtitle: 'Infrastructure control', href: '/dashboard/network-management', status: 'alert', count: 3, description: 'Device health, topology, and fault event oversight.' },
    { id: 'OP-005', name: 'Visitor Management', subtitle: 'Access governance', href: '/dashboard/visitor-management', status: 'healthy', count: 18, description: 'Visitor registry, visits, badges, and logs.' },
  ],
  externalModules: [
    { label: 'Super Admin', href: '/dashboard/super-admin', description: 'Tenant, policy, user, override, monitoring, and audit controls.' },
    { label: 'CIO Incidents', href: '/dashboard/cio/incidents', description: 'Escalation and incident handling for operational risk.' },
    { label: 'CFO Claims', href: '/dashboard/cfo/claims', description: 'Financial claims and denial management.' },
  ],
};

function unwrapListPayload(payload: any): any[] {
  const root = payload?.data ?? payload?.items ?? payload?.results ?? payload;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data)) return root.data;
  return [];
}

function normalizeManagementTask(record: any): ManagementTask {
  return {
    id: String(record?.id ?? record?._id ?? `${Date.now()}`),
    title: record?.title ?? record?.name ?? 'Management Task',
    category: record?.category ?? record?.type ?? 'General',
    owner: record?.owner ?? record?.assignedTo ?? 'Unassigned',
    priority: (record?.priority ?? 'medium').toLowerCase() as ManagementTask['priority'],
    status: (record?.status ?? 'open').toLowerCase() as ManagementTask['status'],
    dueAt: record?.dueAt ?? record?.deadline,
    updatedAt: record?.updatedAt ?? record?.createdAt ?? new Date().toISOString(),
    route: record?.route ?? record?.href,
    tags: Array.isArray(record?.tags) ? record.tags : [],
    description: record?.description ?? record?.summary,
  };
}

export const managementApi = {
  getDashboardData: async (filters: ManagementFilters = {}) => {
    try {
      const response = await apiGet<any>(autoEndpoints.management.list, {
        params: {
          status: filters.status,
          priority: filters.priority,
          category: filters.category,
          q: filters.search,
          limit: 100,
        },
      });

      const items = unwrapListPayload(response);
      const workItems = items.length > 0 ? items.map(normalizeManagementTask) : mockDashboard.workItems;
      const routes = workItems
        .filter((item) => item.route)
        .map((item, index) => ({
          id: `AUTO-${index + 1}`,
          name: item.title,
          source: item.category,
          destination: item.owner,
          condition: item.description ?? 'Management routing rule',
          active: item.status !== 'blocked',
          throughputPerHour: 12 + index * 4,
          latencyMs: 140 + index * 20,
          status: item.status === 'blocked' ? 'degraded' : 'healthy',
        } satisfies ManagementRoute));

      return {
        data: {
          ...mockDashboard,
          workItems,
          routes: routes.length > 0 ? routes : mockDashboard.routes,
        },
        message: 'Success',
        status: 200,
      };
    } catch {
      return { data: mockDashboard, message: 'Using management fallback data', status: 200 };
    }
  },

  createTask: async (payload: Partial<ManagementTask>) => apiPost<any>(autoEndpoints.management.create, payload),
  updateTask: async (id: string, payload: Partial<ManagementTask>) => apiPut<any>(autoEndpoints.management.update(id), payload),
  deleteTask: async (id: string) => apiDelete<any>(autoEndpoints.management.delete(id)),
};
