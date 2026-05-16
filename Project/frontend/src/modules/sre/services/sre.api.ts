/**
 * MedTrustX — SRE API Client
 * Monitoring metrics and incident tracking
 */
import type { SREDashboardData } from '../types/sre.types';

const BASE_URL = '/api/v1/reliability';

export interface SREFilters {
  timeframe?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: SREDashboardData['kpis'] = [
  { id: '1', title: 'Global Uptime', value: '99.98%', status: 'success', delta: '-0.01% this week' },
  { id: '2', title: 'Active Incidents', value: 1, status: 'warning', delta: '1 Investigating' },
  { id: '3', title: 'MTTR', value: '12m', status: 'success', delta: 'vs 15m target' },
  { id: '4', title: 'Error Rate', value: '0.04%', status: 'normal', delta: 'Stable' },
];

const mockServices: SREDashboardData['services'] = [
  { id: 'S1', name: 'EHR Service', status: 'healthy', uptime: '99.99%', latency: '45ms', errorRate: '0.01%' },
  { id: 'S2', name: 'ICU Telemetry', status: 'healthy', uptime: '100%', latency: '12ms', errorRate: '0.00%' },
  { id: 'S3', name: 'Billing API', status: 'degraded', uptime: '99.90%', latency: '850ms', errorRate: '2.40%' },
  { id: 'S4', name: 'Pharmacy Service', status: 'healthy', uptime: '99.95%', latency: '120ms', errorRate: '0.05%' },
];

const mockMetrics: SREDashboardData['metrics'] = [
  { id: 'M1', serviceId: 'S1', cpu: 45, memory: 60, activeConnections: 1200 },
  { id: 'M2', serviceId: 'S2', cpu: 20, memory: 35, activeConnections: 5000 },
  { id: 'M3', serviceId: 'S3', cpu: 95, memory: 88, activeConnections: 350 },
];

const mockIncidents: SREDashboardData['incidents'] = [
  { id: 'INC-1042', title: 'Billing API Latency Spike', serviceId: 'S3', severity: 'high', status: 'investigating', createdAt: new Date().toISOString() },
  { id: 'INC-1041', title: 'Redis Cache Eviction Rate High', serviceId: 'S1', severity: 'medium', status: 'mitigated', createdAt: new Date(Date.now() - 3600000).toISOString() },
];

const mockAlerts: SREDashboardData['alerts'] = [
  { id: 'A1', type: 'latency', message: 'Billing API p99 latency exceeded 800ms', severity: 'high', timestamp: new Date().toISOString() },
  { id: 'A2', type: 'error_spike', message: 'Auth Service returning 5xx for 0.5% requests', severity: 'medium', timestamp: new Date(Date.now() - 120000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const sreApi = {
  getDashboardSummary: async (filters: SREFilters) => ({
    data: {
      kpis: mockKpis,
      services: mockServices,
      metrics: mockMetrics,
      incidents: mockIncidents,
      alerts: mockAlerts,
    } as SREDashboardData,
    message: 'Success', status: 200,
  }),
};
