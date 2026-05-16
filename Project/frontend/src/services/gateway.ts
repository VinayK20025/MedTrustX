/**
 * MedTrustX — Gateway Integration Service
 * ──────────────────────────────────────────────────
 * Centralized service for:
 *   • Aggregating health status from all backend microservices
 *   • Composing dashboard summary data from multiple services
 *   • Service registry and discovery metadata
 *   • System-wide statistics aggregation
 */
import { apiGet, apiPost } from './api';
import type { ApiResponse } from '@/types/api.types';

/* ── Types ────────────────────────────────────────────── */

export interface ServiceHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  uptime: string;
  responseTime: number;
  lastChecked: string;
  version?: string;
  endpoint: string;
}

export interface SystemHealthSummary {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  totalServices: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  services: ServiceHealthStatus[];
  checkedAt: string;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  recentActivity: ActivityEvent[];
  serviceHealth: ServiceHealthStatus[];
  alerts: SystemAlert[];
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'stable';
  category: 'clinical' | 'operational' | 'security' | 'financial';
}

export interface ActivityEvent {
  id: string;
  time: string;
  event: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  source: string;
  entityId?: string;
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

/* ── Service Registry ────────────────────────────────── */

export interface ServiceRegistryEntry {
  name: string;
  displayName: string;
  category: 'clinical' | 'operational' | 'platform' | 'security' | 'infrastructure';
  basePath: string;
  healthEndpoint: string;
  docsEndpoint?: string;
  technology: 'python' | 'nodejs';
  port: number;
}

/**
 * Complete service registry mapping all backend services to their API paths.
 * This is the single source of truth for frontend → backend routing.
 */
export const SERVICE_REGISTRY: ServiceRegistryEntry[] = [
  // ─── Clinical Services (Python/FastAPI) ────────────
  { name: 'patient-service', displayName: 'Patient Service', category: 'clinical', basePath: '/api/v1/patients', healthEndpoint: '/health', technology: 'python', port: 3001 },
  { name: 'clinical-service', displayName: 'Clinical Service', category: 'clinical', basePath: '/api/v1/clinical', healthEndpoint: '/health', technology: 'python', port: 3002 },
  { name: 'diagnostics-service', displayName: 'Diagnostics Service', category: 'clinical', basePath: '/api/v1/diagnostics', healthEndpoint: '/health', technology: 'python', port: 3003 },
  { name: 'pharmacy-service', displayName: 'Pharmacy Service', category: 'clinical', basePath: '/api/v1/pharmacy', healthEndpoint: '/health', technology: 'python', port: 3004 },
  { name: 'nursing-service', displayName: 'Nursing Service', category: 'clinical', basePath: '/api/v1/nursing', healthEndpoint: '/health', technology: 'python', port: 3005 },
  { name: 'ot-service', displayName: 'OT Service', category: 'clinical', basePath: '/api/v1/ot', healthEndpoint: '/health', technology: 'python', port: 3006 },
  { name: 'icu-service', displayName: 'ICU Service', category: 'clinical', basePath: '/api/v1/icu', healthEndpoint: '/health', technology: 'python', port: 3007 },
  { name: 'blood-bank-service', displayName: 'Blood Bank Service', category: 'clinical', basePath: '/api/v1/blood-bank', healthEndpoint: '/health', technology: 'python', port: 3008 },
  { name: 'infection-control-service', displayName: 'Infection Control', category: 'clinical', basePath: '/api/v1/infection-control', healthEndpoint: '/health', technology: 'python', port: 3009 },
  { name: 'medical-records-service', displayName: 'Medical Records', category: 'clinical', basePath: '/api/v1/medical-records', healthEndpoint: '/health', technology: 'python', port: 3010 },
  { name: 'ai-service', displayName: 'AI Service', category: 'platform', basePath: '/api/v1/ai', healthEndpoint: '/health', technology: 'python', port: 3011 },
  { name: 'devices-service', displayName: 'IoMT Devices', category: 'platform', basePath: '/api/v1/devices', healthEndpoint: '/health', technology: 'python', port: 3012 },

  // ─── Operational Services (Node.js/NestJS) ─────────
  { name: 'gateway-service', displayName: 'API Gateway', category: 'platform', basePath: '/api', healthEndpoint: '/health', technology: 'nodejs', port: 4001 },
  { name: 'appointment-service', displayName: 'Appointments', category: 'operational', basePath: '/api/v1/appointments', healthEndpoint: '/health', technology: 'nodejs', port: 4002 },
  { name: 'billing-service', displayName: 'Billing Service', category: 'operational', basePath: '/api/v1/billing', healthEndpoint: '/health', technology: 'nodejs', port: 4003 },
  { name: 'inventory-service', displayName: 'Inventory Service', category: 'operational', basePath: '/api/v1/inventory', healthEndpoint: '/health', technology: 'nodejs', port: 4004 },
  { name: 'hr-service', displayName: 'HR Service', category: 'operational', basePath: '/api/v1/hr', healthEndpoint: '/health', technology: 'nodejs', port: 4005 },
  { name: 'facilities-service', displayName: 'Facilities', category: 'operational', basePath: '/api/v1/facilities', healthEndpoint: '/health', technology: 'nodejs', port: 4006 },
  { name: 'er-service', displayName: 'Emergency', category: 'clinical', basePath: '/api/v1/er', healthEndpoint: '/health', technology: 'nodejs', port: 4007 },
  { name: 'bed-management-service', displayName: 'Bed Management', category: 'operational', basePath: '/api/v1/beds', healthEndpoint: '/health', technology: 'nodejs', port: 4008 },
  { name: 'order-service', displayName: 'Orders', category: 'operational', basePath: '/api/v1/orders', healthEndpoint: '/health', technology: 'nodejs', port: 4009 },
  { name: 'telemedicine-service', displayName: 'Telemedicine', category: 'clinical', basePath: '/api/v1/telemedicine', healthEndpoint: '/health', technology: 'nodejs', port: 4010 },
  { name: 'notification-service', displayName: 'Notifications', category: 'platform', basePath: '/api/v1/notifications', healthEndpoint: '/health', technology: 'nodejs', port: 4011 },
  { name: 'management-service', displayName: 'Management', category: 'operational', basePath: '/api/v1/management', healthEndpoint: '/health', technology: 'nodejs', port: 4012 },
  { name: 'legal-service', displayName: 'Legal Service', category: 'operational', basePath: '/api/v1/legal', healthEndpoint: '/health', technology: 'nodejs', port: 4014 },
  { name: 'compliance-service', displayName: 'Compliance', category: 'security', basePath: '/api/v1/compliance', healthEndpoint: '/health', technology: 'nodejs', port: 4015 },
  { name: 'audit-service', displayName: 'Audit Service', category: 'security', basePath: '/api/v1/audit', healthEndpoint: '/health', technology: 'nodejs', port: 4016 },

  // ─── Platform/ZTA Services (Python) ────────────────
  { name: 'iam-service', displayName: 'IAM Service', category: 'security', basePath: '/api/v1/iam', healthEndpoint: '/health', technology: 'python', port: 5001 },
  { name: 'zta-service', displayName: 'ZTA Engine', category: 'security', basePath: '/api/v1/zta', healthEndpoint: '/health', technology: 'python', port: 5002 },
  { name: 'analytics-service', displayName: 'Analytics', category: 'platform', basePath: '/api/v1/analytics', healthEndpoint: '/health', technology: 'python', port: 5003 },
  { name: 'threat-detection-service', displayName: 'Threat Detection', category: 'security', basePath: '/api/v1/threats', healthEndpoint: '/health', technology: 'python', port: 5004 },
];

/* ── Gateway API Client ──────────────────────────────── */

const GATEWAY_BASE = '/api/v1/gateway';

export const gatewayApi = {
  /** Get aggregated health status of all services */
  getSystemHealth: () =>
    apiGet<SystemHealthSummary>(`${GATEWAY_BASE}/health/all`).catch(() => buildLocalHealthCheck()),

  /** Get composed dashboard summary */
  getDashboardSummary: () =>
    apiGet<DashboardSummary>(`${GATEWAY_BASE}/dashboard/summary`).catch(() => buildFallbackDashboard()),

  /** Get recent system-wide activity */
  getRecentActivity: (limit = 20) =>
    apiGet<ActivityEvent[]>(`${GATEWAY_BASE}/activity/recent`, { params: { limit } }).catch(() => []),

  /** Get system alerts */
  getAlerts: (acknowledged?: boolean) =>
    apiGet<SystemAlert[]>(`${GATEWAY_BASE}/alerts`, { params: { acknowledged } }).catch(() => []),

  /** Acknowledge an alert */
  acknowledgeAlert: (alertId: string) =>
    apiPost<void>(`${GATEWAY_BASE}/alerts/${alertId}/acknowledge`),

  /** Get service registry */
  getServiceRegistry: () =>
    Promise.resolve(SERVICE_REGISTRY),

  /** Check individual service health */
  checkServiceHealth: async (serviceName: string): Promise<ServiceHealthStatus> => {
    const service = SERVICE_REGISTRY.find(s => s.name === serviceName);
    if (!service) {
      return {
        name: serviceName,
        status: 'unknown',
        uptime: 'N/A',
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        endpoint: '',
      };
    }

    const start = performance.now();
    try {
      await apiGet(`${service.basePath}${service.healthEndpoint}`);
      const responseTime = performance.now() - start;
      return {
        name: service.name,
        status: responseTime > 2000 ? 'degraded' : 'healthy',
        uptime: '99.9%',
        responseTime: Math.round(responseTime),
        lastChecked: new Date().toISOString(),
        endpoint: service.basePath,
      };
    } catch {
      return {
        name: service.name,
        status: 'unhealthy',
        uptime: 'N/A',
        responseTime: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
        endpoint: service.basePath,
      };
    }
  },
};

/* ── Fallback Builders (when gateway is unavailable) ── */

async function buildLocalHealthCheck(): Promise<SystemHealthSummary> {
  const results = await Promise.allSettled(
    SERVICE_REGISTRY.slice(0, 10).map(s => gatewayApi.checkServiceHealth(s.name))
  );

  const services = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          name: SERVICE_REGISTRY[i].name,
          status: 'unknown' as const,
          uptime: 'N/A',
          responseTime: 0,
          lastChecked: new Date().toISOString(),
          endpoint: SERVICE_REGISTRY[i].basePath,
        }
  );

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;

  return {
    overallStatus: unhealthyCount > 2 ? 'critical' : degradedCount > 0 || unhealthyCount > 0 ? 'degraded' : 'healthy',
    totalServices: SERVICE_REGISTRY.length,
    healthyCount,
    degradedCount,
    unhealthyCount,
    services,
    checkedAt: new Date().toISOString(),
  };
}

function buildFallbackDashboard(): DashboardSummary {
  return {
    stats: [],
    recentActivity: [],
    serviceHealth: [],
    alerts: [],
  };
}
