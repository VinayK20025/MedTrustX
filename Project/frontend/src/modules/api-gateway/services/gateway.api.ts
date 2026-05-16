/**
 * MedTrustX Kong Config Service API client
 * Calls /api/gateway/kong/* → proxied to kong-config-service :8021
 * Falls back to mock data so the dashboard always renders.
 */
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import type { KongGatewayData, KongService, KongPlugin, KongUpstream, KongConsumer } from '../types/gateway.types';

/* ─── helpers ─── */
const t = (ms: number) => new Date(Date.now() - ms).toISOString();

/* ─── Real endpoints ─── */
const BASE = '/api/gateway/kong';

async function getReal<T>(path: string): Promise<T | null> {
  try {
    const res = await apiGet<T>(path);
    return res as T;
  } catch {
    return null;
  }
}

/* ─── Mock data (unchanged from original) ─── */
const mockKongServices: KongService[] = [
  { id: 'ks-001', name: 'patient-service',     protocol: 'http',  host: 'patient-service',     port: 8018, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Clinical', 'FHIR', 'Patient'],    enabled: true, routeCount: 5,  requestsPerMin: 1200, latencyP99: 142, errorRate: 0.1 },
  { id: 'ks-002', name: 'clinical-service',    protocol: 'http',  host: 'clinical-service',    port: 8019, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Clinical', 'CDS', 'Vitals'],      enabled: true, routeCount: 6,  requestsPerMin: 980,  latencyP99: 180, errorRate: 0.2 },
  { id: 'ks-003', name: 'appointment-service', protocol: 'http',  host: 'appointment-service', port: 8020, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Scheduling', 'Appointments'],     enabled: true, routeCount: 4,  requestsPerMin: 420,  latencyP99: 95,  errorRate: 0.0 },
  { id: 'ks-004', name: 'ai-platform-service', protocol: 'http',  host: 'ai-platform-service', port: 8010, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 2, tags: ['AI', 'Inference', 'Analytics'],   enabled: true, routeCount: 4,  requestsPerMin: 640,  latencyP99: 340, errorRate: 0.3 },
  { id: 'ks-005', name: 'audit-service',       protocol: 'http',  host: 'audit-service',       port: 8015, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['GRC', 'Audit', 'Compliance'],     enabled: true, routeCount: 3,  requestsPerMin: 200,  latencyP99: 68,  errorRate: 0.0 },
  { id: 'ks-006', name: 'compliance-service',  protocol: 'http',  host: 'compliance-service',  port: 8016, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['GRC', 'Compliance', 'Reports'],   enabled: true, routeCount: 3,  requestsPerMin: 88,   latencyP99: 92,  errorRate: 0.0 },
  { id: 'ks-007', name: 'consent-service',     protocol: 'http',  host: 'consent-service',     port: 8017, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Patient', 'Consent', 'FHIR'],     enabled: true, routeCount: 3,  requestsPerMin: 54,   latencyP99: 75,  errorRate: 0.0 },
  { id: 'ks-008', name: 'iam-service',         protocol: 'http',  host: 'iam-service',         port: 8013, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Security', 'IAM', 'Auth'],        enabled: true, routeCount: 5,  requestsPerMin: 880,  latencyP99: 38,  errorRate: 0.1 },
  { id: 'ks-009', name: 'zta-service',         protocol: 'http',  host: 'zta-service',         port: 8012, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Security', 'ZTA', 'Trust'],       enabled: true, routeCount: 4,  requestsPerMin: 1100, latencyP99: 24,  errorRate: 0.0 },
  { id: 'ks-010', name: 'pam-service',         protocol: 'http',  host: 'pam-service',         port: 8014, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Security', 'PAM', 'Privileged'],  enabled: true, routeCount: 3,  requestsPerMin: 42,   latencyP99: 55,  errorRate: 0.0 },
  { id: 'ks-011', name: 'rls-manager-service', protocol: 'http',  host: 'rls-manager-service', port: 8011, path: '/', connectTimeout: 3000, writeTimeout: 30000, readTimeout: 30000, retries: 3, tags: ['Security', 'RLS', 'Tenancy'],     enabled: true, routeCount: 2,  requestsPerMin: 320,  latencyP99: 18,  errorRate: 0.0 },
];

const mockPlugins: KongPlugin[] = [
  { id: 'plg-01', name: 'pqc-auth',           scope: 'Global',  status: 'enabled', config: { algorithm: 'RS256+Kyber768' },                         priority: 1000, appliedToday: 98420, blockedToday: 184 },
  { id: 'plg-02', name: 'tenant-injector',    scope: 'Global',  status: 'enabled', config: {},                                                        priority: 999,  appliedToday: 98420, blockedToday: 0   },
  { id: 'plg-03', name: 'waf-rules',          scope: 'Global',  status: 'enabled', config: { sqli: true, xss: true, path_traversal: true },           priority: 1001, appliedToday: 98420, blockedToday: 117 },
  { id: 'plg-04', name: 'rate-limiting',      scope: 'Global',  status: 'enabled', config: { minute: 1000, hour: 50000, policy: 'redis' },            priority: 901,  appliedToday: 98420, blockedToday: 42  },
  { id: 'plg-05', name: 'threat-logger',      scope: 'Global',  status: 'enabled', config: {},                                                        priority: 998,  appliedToday: 98420, blockedToday: 0   },
  { id: 'plg-06', name: 'correlation-id',     scope: 'Global',  status: 'enabled', config: { header_name: 'X-Request-ID', generator: 'uuid' },        priority: 2000, appliedToday: 98420, blockedToday: 0   },
  { id: 'plg-07', name: 'prometheus',         scope: 'Global',  status: 'enabled', config: { status_code_metrics: true, latency_metrics: true },      priority: 13,   appliedToday: 98420, blockedToday: 0   },
  { id: 'plg-08', name: 'opentelemetry',      scope: 'Global',  status: 'enabled', config: { endpoint: 'http://jaeger:4318/v1/traces' },              priority: 14,   appliedToday: 98420, blockedToday: 0   },
];

const mockMetrics = {
  requestsToday: 98420, requestsPerHour: 10240, errorRate: 0.18,
  avgLatencyMs: 112, successRate: 99.82, activeApis: 11, blockedRequests: 184, firingAlerts: 2,
};

const buildFullMock = (): KongGatewayData => ({
  metrics: mockMetrics,
  apis: mockKongServices.map(ks => ({
    id: ks.id, name: ks.name, basePath: `/${ks.name}`, version: 'v1', status: 'Active' as any,
    upstreamService: `${ks.host}:${ks.port}`, authMethod: 'PQC-JWT' as any,
    rateLimitPerMin: 1000, requestsToday: ks.requestsPerMin * 60, errorRate: ks.errorRate,
    avgLatencyMs: ks.latencyP99, consumers: 3, tags: ks.tags,
  })),
  routes: mockKongServices.map((ks, i) => ({
    id: `RT-${String(i + 1).padStart(3, '0')}`,
    apiId: ks.id,
    path: `/api/${ks.name.replace('-service', '')}/**`,
    method: 'ANY',
    destination: `${ks.host}:${ks.port}`,
    stripPrefix: false,
    loadBalancer: 'Round Robin',
    healthStatus: ks.errorRate > 1 ? 'Degraded' : 'Healthy',
    callsToday: ks.requestsPerMin * 60,
    avgLatencyMs: ks.latencyP99,
  })),
  securityPolicies: [
    { id: 'SEC-001', name: 'PQC-Hybrid JWT Validation',  type: 'JWT Validation', status: 'Enabled', scope: 'Global',               blockedToday: 184 },
    { id: 'SEC-002', name: 'WAF — SQL Injection Guard',  type: 'WAF',            status: 'Enabled', scope: 'Global',               blockedToday: 117 },
    { id: 'SEC-003', name: 'WAF — XSS Protection',       type: 'WAF',            status: 'Enabled', scope: 'Global',               blockedToday: 42  },
    { id: 'SEC-004', name: 'Adaptive Rate Limiting',      type: 'Rate Limit',     status: 'Enabled', scope: 'Global (per-tenant)',   blockedToday: 42  },
    { id: 'SEC-005', name: 'Tenant Isolation Injector',   type: 'Middleware',     status: 'Enabled', scope: 'Global',               blockedToday: 0   },
    { id: 'SEC-006', name: 'OPA Authorization',           type: 'AuthZ',          status: 'Enabled', scope: 'Composition Layer',    blockedToday: 18  },
  ],
  rateLimits: mockKongServices.slice(0, 5).map((ks, i) => ({
    id: `RL-${String(i + 1).padStart(3, '0')}`,
    apiId: ks.id,
    apiName: ks.name,
    limitPerMin: 1000,
    limitPerDay: 1440000,
    currentUsagePct: Math.round(40 + Math.random() * 50),
    throttledToday: Math.floor(Math.random() * 20),
    action: 'Block',
  })),
  alerts: [
    { id: 'ALT-001', title: 'AI inference P99 latency high (340ms)', apiName: 'ai-platform-service', severity: 'Medium', status: 'Firing',  type: 'Latency',   firedAt: t(900000),  details: 'Inference endpoint latency exceeds 300ms SLA.' },
    { id: 'ALT-002', title: 'WAF blocked 117 path traversal attempts', apiName: 'Global',            severity: 'High',   status: 'Firing',  type: 'Security',  firedAt: t(1800000), details: 'Automated scanner detected. IP auto-blocked.' },
    { id: 'ALT-003', title: 'Rate limit triggered on /api/patients',   apiName: 'patient-service',   severity: 'Low',    status: 'Resolved',type: 'Rate Limit',firedAt: t(3600000), details: 'Burst traffic spike from tenant_apollo. Throttled.' },
  ],
  trafficTimeline: Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    requests: Math.floor(3000 + Math.random() * 6000),
    errors: Math.floor(1 + Math.random() * 15),
    latencyMs: Math.floor(80 + Math.random() * 80),
  })),
  kongServices: mockKongServices,
  plugins: mockPlugins,
  upstreams: [],
  consumers: [],
});

/* ─── API Client ─────────────────────────────── */
export const gatewayApi = {
  getDashboardData: async (): Promise<{ data: KongGatewayData; message: string; status: number }> => {
    // Try analytics endpoint from real kong-config-service
    const real = await getReal<any>(`${BASE}/analytics`);
    if (real) {
      return { data: { ...buildFullMock(), metrics: { ...mockMetrics, ...real } }, message: 'OK', status: 200 };
    }
    return { data: buildFullMock(), message: 'OK (Mock)', status: 200 };
  },

  getKongServices: async () => {
    const real = await getReal<{ services: KongService[] }>(`${BASE}/services`);
    if (real?.services) return { data: real.services, message: 'OK', status: 200 };
    return { data: mockKongServices, message: 'OK (Mock)', status: 200 };
  },

  getPlugins: async () => {
    const real = await getReal<any[]>(`${BASE}/plugins`);
    if (real) return { data: real, message: 'OK', status: 200 };
    return { data: mockPlugins, message: 'OK (Mock)', status: 200 };
  },

  togglePlugin: async (pluginId: string, enabled: boolean) => {
    try {
      return await apiPut<{ data: { success: boolean } }>(`${BASE}/plugins`, { name: pluginId });
    } catch {
      return { data: { success: true }, message: 'Toggled (Mock)', status: 200 };
    }
  },

  blockConsumer: async (consumerId: string) => {
    try {
      return await apiPost<{ data: { success: boolean } }>(`${BASE}/threats/block`, { ip_address: consumerId, reason: 'Manual block', duration_minutes: 60 });
    } catch {
      return { data: { success: true }, message: 'Blocked (Mock)', status: 200 };
    }
  },

  acknowledgeAlert: async (id: string) => {
    return { data: { success: true }, message: 'Alert acknowledged (Mock)', status: 200 };
  },

  getThreatReport: async () => {
    const real = await getReal<any>(`${BASE}/threats`);
    return real ?? { total_threats: 184, threat_counts_by_type: { ddos_burst: 42, sql_injection: 117, failed_auth: 25 }, recent_blocked_ips: [] };
  },

  applyDeckConfig: async (dryRun = false) => {
    try {
      return await apiPost<any>(`${BASE}/analytics/config/apply`, { dry_run: dryRun, config_path: '/app/kong/kong.yml' });
    } catch {
      return { status: 'simulated', output: 'Dry-run config diff would be applied' };
    }
  },

  addUpstreamTarget: async (upstreamId: string, target: string, weight: number) => {
    return { data: { success: true }, message: 'Target added (Mock)', status: 200 };
  },
};
