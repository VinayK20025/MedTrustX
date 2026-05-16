/**
 * MedTrustX — Super Admin API Client
 * Global command-and-control data layer across all tenants
 */
import type {
  SuperAdminDashboardData, TenantInfo, GlobalPolicy, GlobalUser,
  SystemOverride, ServiceHealth, InfraMetrics, SystemMetricTimeSeries,
  GlobalAuditLog, GlobalAlert, ProductivityMetrics, SuperAdminKPI,
} from '../types/superAdmin.types';

const BASE_URL = '/api/v1/admin/super';

export interface SuperAdminFilters {
  timeframe?: 'today' | '7d' | '30d' | '90d';
  tenantId?: string;
}

/* ── MOCK FALLBACK DATA ──────────────────────────────────── */

const mockKpis: SuperAdminKPI[] = [
  { id: '1', title: 'Active Tenants', value: 12, format: 'number', status: 'success', trend: 8.3, trendDirection: 'up', delta: '+1 This Month', actionLabel: 'Manage Tenants', actionUrl: '/dashboard/super-admin/tenants' },
  { id: '2', title: 'Global Users', value: 8420, format: 'number', status: 'normal', trend: 3.2, trendDirection: 'up', delta: '+124 This Week' },
  { id: '3', title: 'Enforced Policies', value: 145, format: 'number', status: 'success', trend: 2.1, trendDirection: 'up', delta: '5 Applied Today', actionLabel: 'View Policies', actionUrl: '/dashboard/super-admin/policies' },
  { id: '4', title: 'Active Overrides', value: 1, format: 'number', status: 'warning', trend: 0, trendDirection: 'neutral', delta: 'Emergency Patch', actionLabel: 'Review', actionUrl: '/dashboard/super-admin/overrides' },
  { id: '5', title: 'Global Uptime', value: '99.99%', format: 'uptime', status: 'success', delta: '30-day SLA Met' },
  { id: '6', title: 'Compliance Score', value: 97.2, format: 'percentage', status: 'success', trend: 1.4, trendDirection: 'up', delta: 'NABH + HIPAA' },
  { id: '7', title: 'MFA Adoption', value: 94.8, format: 'percentage', status: 'normal', trend: 2.7, trendDirection: 'up', delta: '7,986 / 8,420 Users' },
  { id: '8', title: 'Security Score', value: 96, format: 'percentage', status: 'success', trend: 0.5, trendDirection: 'up', delta: 'Zero Trust Active' },
];

const mockTenants: TenantInfo[] = [
  { id: 'T-101', name: 'Metro General Hospital', code: 'MGH', region: 'IN-Mumbai', status: 'active', users: 1450, activeUsers: 1280, licenseLevel: 'Enterprise', licenseExpiry: '2027-03-15', compliance: 98.5, uptime: 99.99, dataRegion: 'ap-south-1', mfaEnforced: true, lastAudit: '2026-04-01', createdAt: '2024-01-15', primaryContact: 'dr.sharma@mgh.org', modules: ['EHR', 'ICU', 'OT', 'Pharmacy', 'Billing', 'ZTA'] },
];

const mockPolicies: GlobalPolicy[] = [
  { id: 'POL-001', name: 'Zero Trust Network Access (ZTNA) Default Deny', description: 'All network access requires explicit trust verification. No implicit trust based on network location.', category: 'security', scope: 'global', status: 'enforced', severity: 'critical', affectedTenants: 12, totalTenants: 12, lastUpdated: '2026-01-15', updatedBy: 'super_admin_1', version: '3.2.0', tags: ['ZTNA', 'mandatory'] },
];

const mockUsers: GlobalUser[] = [
  { id: 'U-001', name: 'Dr. Priya Sharma', email: 'priya.sharma@mgh.org', role: 'Chief Medical Officer', department: 'Administration', tenantId: 'T-101', tenantName: 'Metro General Hospital', status: 'active', mfaEnabled: true, lastLogin: new Date(Date.now() - 1800000).toISOString(), loginAttempts: 0, riskScore: 5, sessions: 2, createdAt: '2024-01-20', permissions: ['clinical:read', 'clinical:write', 'admin:read'] },
];

const mockOverrides: SystemOverride[] = [
  { id: 'OVR-991', targetSystem: 'IAM Gateway — EU-Central', targetTenant: 'T-103 (Central Care Hub)', category: 'emergency', reason: 'Emergency Patch Deployment — CVE-2026-4421', justification: 'Critical vulnerability in authentication module requires immediate patching with temporary bypass.', initiatedBy: 'super_admin_1', approvedBy: 'super_admin_2', timestamp: new Date(Date.now() - 3600000).toISOString(), expiresAt: new Date(Date.now() + 7200000).toISOString(), status: 'active', riskLevel: 'critical', affectedUsers: 890, rollbackPlan: 'Revert to IAM v3.1.2 backup configuration', auditTrailId: 'AUD-8881' },
];

const mockServices: ServiceHealth[] = [
  { id: 'svc-01', name: 'patient-service', displayName: 'Patient Service', status: 'healthy', uptime: 99.99, responseTime: 23, errorRate: 0.01, throughput: 1240, region: 'ap-south-1', lastCheck: new Date().toISOString(), incidents: 0, cpu: 34, memory: 58, connections: 245 },
];

const mockInfra: InfraMetrics = {
  totalNodes: 24, healthyNodes: 23, totalContainers: 156, runningContainers: 152,
  cpuUtilization: 42.3, memoryUtilization: 61.7, diskUtilization: 38.5,
  networkInMbps: 245, networkOutMbps: 189, activeConnections: 3245,
  queueDepth: 12, cacheHitRate: 97.8,
};

const mockTimeSeries: SystemMetricTimeSeries[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${String(i).padStart(2, '0')}:00`,
  cpu: 30 + Math.random() * 30,
  memory: 50 + Math.random() * 20,
  requests: 800 + Math.random() * 600,
  errors: Math.floor(Math.random() * 5),
  latency: 15 + Math.random() * 40,
}));

const mockAuditLogs: GlobalAuditLog[] = [
  { id: 'AUD-8881', action: 'Emergency Override Activated — IAM Gateway', category: 'override', actor: 'super_admin_1', actorRole: 'Super Administrator', tenant: 'T-103', targetResource: 'IAM Gateway', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'critical', ipAddress: '10.0.1.50', correlationId: 'COR-991', outcome: 'success', details: 'Override OVR-991 activated for CVE-2026-4421 patching' },
];

const mockAlerts: GlobalAlert[] = [
  { id: 'ALT-001', type: 'security', severity: 'critical', title: 'Brute Force Attack Detected', message: 'Multiple failed login attempts from IP 203.0.113.42 targeting T-103 IAM gateway. Account auto-locked.', tenant: 'T-103', source: 'ZTA Engine', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'active', actionRequired: true, actionLabel: 'Investigate', relatedAlerts: 3 },
];

const mockProductivity: ProductivityMetrics = {
  policiesAppliedToday: 5, overridesUsedToday: 1, globalUptime: 99.99,
  tenantsProvisioned: 1, usersOnboarded: 24, incidentsResolved: 3,
  auditChecks: 847, complianceScore: 97.2, mfaAdoptionRate: 94.8, avgResponseTime: 34,
};

/* ── API Service ───────────────────────────────────────── */
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import { autoEndpoints } from '@/services/autoEndpoints';

export const superAdminApi = {
  getDashboardSummary: async (filters: SuperAdminFilters): Promise<{ data: SuperAdminDashboardData; message: string; status: number }> => {
    try {
      const [metricsRes, usersRes, policiesRes, alertsRes, auditRes] = await Promise.allSettled([
        apiGet<any>(endpoints.gateway.dashboardSummary, { params: filters }),
        apiGet<any>(endpoints.iam.users, { params: { limit: 10 } }),
        apiGet<any>(endpoints.zta.policies),
        apiGet<any>(endpoints.gateway.alerts, { params: { global: true, unread: true } }),
        apiGet<any>(endpoints.audit.events),
      ]);

      const metrics = metricsRes.status === 'fulfilled' ? metricsRes.value?.data : null;
      const users = usersRes.status === 'fulfilled' ? usersRes.value?.data ?? [] : mockUsers;
      const policies = policiesRes.status === 'fulfilled' ? policiesRes.value?.data ?? [] : mockPolicies;
      const alerts = alertsRes.status === 'fulfilled' ? alertsRes.value?.data ?? [] : mockAlerts;
      const auditLogs = auditRes.status === 'fulfilled' ? auditRes.value?.data ?? [] : mockAuditLogs;

      return {
        data: {
          kpis: metrics?.kpis ?? mockKpis,
          tenants: metrics?.tenants ?? mockTenants,
          policies,
          users,
          overrides: metrics?.overrides ?? mockOverrides,
          monitoring: metrics?.monitoring ?? { services: mockServices, infra: mockInfra, timeSeries: mockTimeSeries },
          auditLogs,
          alerts,
          productivity: metrics?.productivity ?? mockProductivity,
        },
        message: 'Success', 
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          kpis: mockKpis, tenants: mockTenants, policies: mockPolicies,
          users: mockUsers, overrides: mockOverrides,
          monitoring: { services: mockServices, infra: mockInfra, timeSeries: mockTimeSeries },
          auditLogs: mockAuditLogs, alerts: mockAlerts, productivity: mockProductivity,
        },
        message: 'Failed to load live data, falling back to cached state', 
        status: 500,
      };
    }
  },

  // Tenant mutations
  provisionTenant: async (data: Partial<TenantInfo>) => {
    await apiPost(autoEndpoints.multiTenantIsolationManager.create, data);
    return { data: { success: true }, message: 'Tenant provisioned', status: 201 };
  },
  suspendTenant: async (tenantId: string, reason: string) => {
    await apiPut(autoEndpoints.multiTenantIsolationManager.update(tenantId), { status: 'suspended', reason });
    return { data: { success: true }, message: 'Tenant suspended', status: 200 };
  },

  // Policy mutations
  applyPolicy: async (policyId: string, status: string) => {
    await apiPut(`${endpoints.zta.policies}/${policyId}`, { status });
    return { data: { success: true }, message: `Policy ${status}`, status: 200 };
  },
  createPolicy: async (data: Partial<GlobalPolicy>) => {
    await apiPost(endpoints.zta.policies, data);
    return { data: { success: true }, message: 'Policy created', status: 201 };
  },

  // User mutations
  lockUser: async (userId: string, reason: string) => {
    await apiPut(`${endpoints.iam.users}/${userId}/lock`, { reason });
    return { data: { success: true }, message: 'User locked', status: 200 };
  },
  enforceMfa: async (userId: string) => {
    await apiPut(`${endpoints.iam.users}/${userId}/enforce-mfa`, {});
    return { data: { success: true }, message: 'MFA enforced', status: 200 };
  },
  resetPassword: async (userId: string) => {
    await apiPost(`${endpoints.iam.users}/${userId}/reset-password`, {});
    return { data: { success: true }, message: 'Password reset sent', status: 200 };
  },

  // Override mutations
  createOverride: async (data: Partial<SystemOverride>) => {
    await apiPost(autoEndpoints.zeroTrustNetworkControl.create, data);
    return { data: { success: true }, message: 'Override created', status: 201 };
  },
  revokeOverride: async (overrideId: string) => {
    await apiDelete(autoEndpoints.zeroTrustNetworkControl.delete(overrideId));
    return { data: { success: true }, message: 'Override revoked', status: 200 };
  },

  // Alert mutations
  acknowledgeAlert: async (alertId: string) => {
    await apiPost(endpoints.gateway.acknowledgeAlert(alertId));
    return { data: { success: true }, message: 'Alert acknowledged', status: 200 };
  },
  resolveAlert: async (alertId: string) => {
    await apiPut(`${endpoints.gateway.alerts}/${alertId}/resolve`, {});
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  },
};
