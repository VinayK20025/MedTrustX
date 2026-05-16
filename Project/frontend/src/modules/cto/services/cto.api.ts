/**
 * MedTrustX — CTO API Client
 * Platform Engineering data layer
 */
import type { CtoDashboardData } from '../types/cto.types';

const BASE_URL = '/api/v1/platform/cto';

export interface CtoFilters {
  environment?: 'production' | 'staging' | 'development';
  timeRange?: '1h' | '6h' | '24h' | '7d';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CtoDashboardData['kpis'] = [
  { id: '1', title: 'Deploy Frequency', value: '18/day', status: 'healthy', delta: '+3 vs last week', actionLabel: 'Pipelines', actionUrl: '/dashboard/cto/pipelines' },
  { id: '2', title: 'Build Success', value: '96.4%', status: 'healthy', delta: '+1.2%', actionLabel: 'CI/CD', actionUrl: '/dashboard/cto/pipelines' },
  { id: '3', title: 'P99 Latency', value: '142ms', status: 'warning', delta: '+18ms', actionLabel: 'Performance', actionUrl: '/dashboard/cto/performance' },
  { id: '4', title: 'Error Rate', value: '0.24%', status: 'healthy', delta: '-0.08%', actionLabel: 'Metrics', actionUrl: '/dashboard/cto/performance' },
  { id: '5', title: 'Tech Debt Items', value: 23, status: 'warning', delta: '+4 this sprint', actionLabel: 'Backlog', actionUrl: '/dashboard/cto/tech-debt' },
];

const mockServices: CtoDashboardData['services'] = [
  { id: 'S1', name: 'api-gateway', version: 'v2.4.1', status: 'healthy', language: 'Go', latencyP99: 45, errorRate: 0.01, replicas: 3, dependencies: ['identity-service', 'patient-service'], lastDeployed: '2h ago' },
  { id: 'S2', name: 'identity-service', version: 'v1.8.0', status: 'healthy', language: 'Python', latencyP99: 62, errorRate: 0.02, replicas: 2, dependencies: ['keycloak', 'postgres'], lastDeployed: '1d ago' },
  { id: 'S3', name: 'patient-service', version: 'v3.1.2', status: 'healthy', language: 'Python', latencyP99: 88, errorRate: 0.05, replicas: 3, dependencies: ['postgres', 'redis', 'event-bus'], lastDeployed: '4h ago' },
  { id: 'S4', name: 'pharmacy-service', version: 'v2.0.4', status: 'degraded', language: 'Python', latencyP99: 210, errorRate: 0.18, replicas: 2, dependencies: ['postgres', 'inventory-service'], lastDeployed: '3d ago' },
  { id: 'S5', name: 'icu-service', version: 'v1.5.0', status: 'healthy', language: 'Python', latencyP99: 55, errorRate: 0.03, replicas: 2, dependencies: ['postgres', 'event-bus', 'iomt-bridge'], lastDeployed: '6h ago' },
  { id: 'S6', name: 'notification-service', version: 'v1.2.1', status: 'healthy', language: 'Node.js', latencyP99: 32, errorRate: 0.01, replicas: 2, dependencies: ['redis', 'smtp-relay'], lastDeployed: '2d ago' },
];

const mockPipelines: CtoDashboardData['pipelines'] = [
  { id: 'P1', repo: 'patient-service', branch: 'main', status: 'success', triggeredBy: 'merge', duration: 184, startedAt: new Date(Date.now() - 3600000).toISOString(), commit: 'a1b2c3d', stage: 'deploy-prod' },
  { id: 'P2', repo: 'pharmacy-service', branch: 'fix/inventory-sync', status: 'failed', triggeredBy: 'push', duration: 92, startedAt: new Date(Date.now() - 7200000).toISOString(), commit: 'e4f5g6h', stage: 'test' },
  { id: 'P3', repo: 'frontend', branch: 'feat/cto-dashboard', status: 'running', triggeredBy: 'push', startedAt: new Date(Date.now() - 300000).toISOString(), commit: 'i7j8k9l', stage: 'build' },
  { id: 'P4', repo: 'icu-service', branch: 'main', status: 'success', triggeredBy: 'merge', duration: 156, startedAt: new Date(Date.now() - 21600000).toISOString(), commit: 'm0n1o2p', stage: 'deploy-prod' },
];

const mockPerformance: CtoDashboardData['performance'] = [
  { service: 'api-gateway', latencyP50: 12, latencyP99: 45, throughput: 1250, errorRate: 0.01, saturation: 34 },
  { service: 'identity-service', latencyP50: 18, latencyP99: 62, throughput: 820, errorRate: 0.02, saturation: 42 },
  { service: 'patient-service', latencyP50: 24, latencyP99: 88, throughput: 680, errorRate: 0.05, saturation: 58 },
  { service: 'pharmacy-service', latencyP50: 65, latencyP99: 210, throughput: 340, errorRate: 0.18, saturation: 78 },
  { service: 'icu-service', latencyP50: 15, latencyP99: 55, throughput: 420, errorRate: 0.03, saturation: 38 },
];

const mockTechDebt: CtoDashboardData['techDebt'] = [
  { id: 'TD1', title: 'Migrate pharmacy-service from sync to async DB driver', severity: 'high', category: 'architecture', repo: 'pharmacy-service', effort: '5d', status: 'planned', createdAt: '2026-04-10' },
  { id: 'TD2', title: 'Replace deprecated bcrypt in identity-service', severity: 'critical', category: 'dependency', repo: 'identity-service', effort: '1d', assignedTo: 'S. Kumar', status: 'in_progress', createdAt: '2026-04-08' },
  { id: 'TD3', title: 'Add integration tests for ICU vitals pipeline', severity: 'medium', category: 'testing', repo: 'icu-service', effort: '3d', status: 'backlog', createdAt: '2026-04-12' },
];

const mockAlerts: CtoDashboardData['alerts'] = [
  { id: 'A1', type: 'warning', category: 'Performance', message: 'pharmacy-service P99 latency at 210ms — exceeds 150ms SLO threshold.', service: 'pharmacy-service', timestamp: new Date(Date.now() - 1800000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'critical', category: 'Build Failure', message: 'pharmacy-service CI pipeline failed at test stage — fix/inventory-sync branch.', service: 'pharmacy-service', timestamp: new Date(Date.now() - 7200000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'info', category: 'Deployment', message: 'patient-service v3.1.2 deployed to production successfully — 0 rollback triggers.', service: 'patient-service', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: false },
];

/* ── API Service ───────────────────────────────────────── */

export const ctoApi = {
  getDashboardSummary: async (filters: CtoFilters) => ({
    data: {
      kpis: mockKpis,
      services: mockServices,
      pipelines: mockPipelines,
      performance: mockPerformance,
      techDebt: mockTechDebt,
      alerts: mockAlerts,
    } as CtoDashboardData,
    message: 'Success',
    status: 200,
  }),

  retryPipeline: async (pipelineId: string) => {
    return { data: { success: true }, message: 'Pipeline retried', status: 200 };
  },

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  },
};
