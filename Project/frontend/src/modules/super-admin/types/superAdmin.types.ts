/**
 * MedTrustX — Super Administrator Types
 * ──────────────────────────────────────────────
 * Global multi-tenant governance, control, and compliance.
 * Covers: Tenants, Policies, Users, Overrides, Monitoring, Audit, Alerts, Productivity.
 */

/* ── KPI ───────────────────────────────────────────────── */

export interface SuperAdminKPI {
  id: string;
  title: string;
  value: string | number;
  format: 'number' | 'percentage' | 'uptime' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

/* ── Tenant Management ─────────────────────────────────── */

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  region: string;
  status: 'active' | 'suspended' | 'maintenance' | 'provisioning';
  users: number;
  activeUsers: number;
  licenseLevel: 'Enterprise' | 'Premium' | 'Standard' | 'Trial';
  licenseExpiry: string;
  compliance: number; // percentage
  uptime: number; // percentage
  dataRegion: string;
  mfaEnforced: boolean;
  lastAudit: string;
  createdAt: string;
  primaryContact: string;
  modules: string[];
}

export interface TenantMetrics {
  totalPatients: number;
  activeBeds: number;
  monthlyRevenue: number;
  incidents: number;
  storageUsedGB: number;
  storageLimitGB: number;
  apiCallsToday: number;
  apiRateLimit: number;
}

/* ── Global Policy Engine ──────────────────────────────── */

export interface GlobalPolicy {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'access_control' | 'data_governance' | 'operational';
  scope: 'global' | 'tenant_specific';
  status: 'enforced' | 'audit_only' | 'disabled' | 'pending_review';
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedTenants: number;
  totalTenants: number;
  lastUpdated: string;
  updatedBy: string;
  version: string;
  tags: string[];
}

/* ── Cross-Tenant Users ────────────────────────────────── */

export interface GlobalUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  tenantId: string;
  tenantName: string;
  status: 'active' | 'inactive' | 'locked' | 'pending_mfa';
  mfaEnabled: boolean;
  lastLogin: string;
  loginAttempts: number;
  riskScore: number; // 0-100
  sessions: number;
  createdAt: string;
  permissions: string[];
}

export interface UserFilters {
  search?: string;
  tenant?: string;
  role?: string;
  status?: string;
  mfaStatus?: 'enabled' | 'disabled' | 'all';
}

/* ── System Overrides ──────────────────────────────────── */

export interface SystemOverride {
  id: string;
  targetSystem: string;
  targetTenant: string;
  category: 'access_control' | 'rate_limit' | 'feature_flag' | 'maintenance' | 'emergency';
  reason: string;
  justification: string;
  initiatedBy: string;
  approvedBy?: string;
  timestamp: string;
  expiresAt?: string;
  status: 'active' | 'revoked' | 'expired' | 'pending_approval';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  affectedUsers: number;
  rollbackPlan: string;
  auditTrailId: string;
}

/* ── System Monitoring ─────────────────────────────────── */

export interface ServiceHealth {
  id: string;
  name: string;
  displayName: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number; // ms
  errorRate: number; // percentage
  throughput: number; // requests/sec
  region: string;
  lastCheck: string;
  incidents: number;
  cpu: number;
  memory: number;
  connections: number;
}

export interface InfraMetrics {
  totalNodes: number;
  healthyNodes: number;
  totalContainers: number;
  runningContainers: number;
  cpuUtilization: number;
  memoryUtilization: number;
  diskUtilization: number;
  networkInMbps: number;
  networkOutMbps: number;
  activeConnections: number;
  queueDepth: number;
  cacheHitRate: number;
}

export interface SystemMetricTimeSeries {
  timestamp: string;
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  latency: number;
}

/* ── Global Audit Trail ────────────────────────────────── */

export interface GlobalAuditLog {
  id: string;
  action: string;
  category: 'auth' | 'policy' | 'override' | 'tenant' | 'user' | 'system' | 'data';
  actor: string;
  actorRole: string;
  tenant: string;
  targetResource: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
  userAgent?: string;
  details?: string;
  correlationId: string;
  outcome: 'success' | 'failure' | 'blocked';
}

/* ── Global Alerts ─────────────────────────────────────── */

export interface GlobalAlert {
  id: string;
  type: 'security' | 'compliance' | 'operational' | 'infrastructure' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  tenant: string;
  source: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  assignedTo?: string;
  actionRequired: boolean;
  actionLabel?: string;
  actionUrl?: string;
  relatedAlerts: number;
  ttl?: string; // auto-resolve time
}

/* ── Productivity Metrics ──────────────────────────────── */

export interface ProductivityMetrics {
  policiesAppliedToday: number;
  overridesUsedToday: number;
  globalUptime: number;
  tenantsProvisioned: number;
  usersOnboarded: number;
  incidentsResolved: number;
  auditChecks: number;
  complianceScore: number;
  mfaAdoptionRate: number;
  avgResponseTime: number;
}

/* ── Dashboard Aggregate ───────────────────────────────── */

export interface SuperAdminDashboardData {
  kpis: SuperAdminKPI[];
  tenants: TenantInfo[];
  policies: GlobalPolicy[];
  users: GlobalUser[];
  overrides: SystemOverride[];
  monitoring: {
    services: ServiceHealth[];
    infra: InfraMetrics;
    timeSeries: SystemMetricTimeSeries[];
  };
  auditLogs: GlobalAuditLog[];
  alerts: GlobalAlert[];
  productivity: ProductivityMetrics;
}
