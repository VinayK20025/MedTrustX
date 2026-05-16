/**
 * MedTrustX — CIO API Client
 */
import { apiGet, apiPost } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type { CioDashboardData, CioAlert, Incident } from '../types/cio.types';

const BASE_URL = '/api/v1/system/cio';

export interface CioFilters {
  environment?: 'prod' | 'staging' | 'dev';
  timeWindow?: '1h' | '24h' | '7d';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CioDashboardData['kpis'] = [
  { id: '1', title: 'System Uptime', value: '99.98%', status: 'healthy', trend: '+0.01%', actionLabel: 'View SLIs', actionUrl: '/dashboard/cio/services' },
  { id: '2', title: 'Active Incidents', value: 2, status: 'warning', trend: 'P2', actionLabel: 'Manage', actionUrl: '/dashboard/cio/incidents' },
  { id: '3', title: 'API Latency (p99)', value: '142ms', status: 'healthy', trend: '-5ms', actionLabel: 'View Traces', actionUrl: '/dashboard/cio/services' },
  { id: '4', title: 'Deploy Success', value: '100%', status: 'healthy', actionLabel: 'Releases', actionUrl: '/dashboard/cio/deployments' },
];

const mockServices: CioDashboardData['services'] = [
  { id: 'S1', name: 'Identity Service (ZTA)', status: 'online', uptime: '99.99%', latency: 45, errorRate: 0.01 },
  { id: 'S2', name: 'EHR Core API', status: 'degraded', uptime: '99.95%', latency: 850, errorRate: 2.4 },
  { id: 'S3', name: 'Analytics Pipeline', status: 'online', uptime: '99.90%', latency: 120, errorRate: 0.5 },
  { id: 'S4', name: 'Clinical Messaging', status: 'online', uptime: '99.99%', latency: 65, errorRate: 0.05 },
];

const mockInfra: CioDashboardData['infrastructure'] = [
  { id: 'N1', name: 'k8s-prod-worker-1', type: 'compute', cpuUsage: 65, memUsage: 82, status: 'warning' },
  { id: 'N2', name: 'k8s-prod-worker-2', type: 'compute', cpuUsage: 45, memUsage: 55, status: 'healthy' },
  { id: 'N3', name: 'pg-cluster-primary', type: 'database', cpuUsage: 30, memUsage: 60, status: 'healthy' },
  { id: 'N4', name: 'redis-cache-tier', type: 'cache', cpuUsage: 88, memUsage: 94, status: 'critical' },
];

const mockPipelines: CioDashboardData['pipelines'] = [
  { id: 'P1', name: 'Daily Claims Sync', lastRun: new Date(Date.now() - 3600000).toISOString(), status: 'success', recordsProcessed: 145000 },
  { id: 'P2', name: 'HL7 Data Ingestion', lastRun: new Date().toISOString(), status: 'running', recordsProcessed: 2340 },
  { id: 'P3', name: 'Nightly Audit Log Backup', lastRun: new Date(Date.now() - 86400000).toISOString(), status: 'failed', recordsProcessed: 0 },
];

const mockIncidents: CioDashboardData['incidents'] = [
  { id: 'INC-1042', title: 'High latency on EHR Core API', severity: 'p2', status: 'investigating', system: 'EHR Core', assignedTo: 'Platform Team', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'INC-1041', title: 'Redis cache eviction rate spiked', severity: 'p3', status: 'open', system: 'Infrastructure', createdAt: new Date(Date.now() - 3600000).toISOString() },
];

const mockAlerts: CioAlert[] = [
  { id: 'A1', type: 'critical', message: 'Redis cache memory usage > 90%', system: 'Infrastructure', timestamp: new Date().toISOString(), actionRequired: true },
  { id: 'A2', type: 'warning', message: 'EHR Core API error rate exceeds SLI threshold (2%)', system: 'EHR Core API', timestamp: new Date(Date.now() - 900000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'info', message: 'HL7 Data Ingestion pipeline latency increasing', system: 'Data Pipelines', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: false },
];

/* ── API Service ───────────────────────────────────────── */

export const cioApi = {
  getDashboardSummary: async (filters: CioFilters) => ({
    data: {
      kpis: mockKpis,
      services: mockServices,
      infrastructure: mockInfra,
      pipelines: mockPipelines,
      incidents: mockIncidents,
      alerts: mockAlerts,
    } as CioDashboardData,
    message: 'Success',
    status: 200,
  }),

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert dismissed', status: 200 };
  },

  acknowledgeIncident: async (incidentId: string) => {
    return { data: { success: true }, message: 'Incident acknowledged', status: 200 };
  }
};
