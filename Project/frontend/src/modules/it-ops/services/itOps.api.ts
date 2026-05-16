/**
 * MedTrustX — IT Ops API Client
 * Executive-level visibility into system health and SLAs
 */
import type { ITOpsDashboardData } from '../types/itOps.types';

const BASE_URL = '/api/v1/operations/it';

export interface ITOpsFilters {
  timeframe?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: ITOpsDashboardData['kpis'] = [
  { id: '1', title: 'System Uptime', value: '99.95%', status: 'success', delta: 'Target: 99.99%' },
  { id: '2', title: 'SLA Compliance', value: '98%', status: 'warning', delta: '2 Systems At Risk' },
  { id: '3', title: 'Active Incidents', value: 2, status: 'warning', delta: '1 Critical' },
  { id: '4', title: 'Avg Response Time', value: '4m 30s', status: 'success', delta: '-30s vs last week' },
];

const mockHealth: ITOpsDashboardData['health'] = [
  { id: 'SYS-1', system: 'EHR Core', status: 'healthy', uptime: '99.99%', lastIncident: '12 days ago' },
  { id: 'SYS-2', system: 'PACS (Imaging)', status: 'degraded', uptime: '99.85%', lastIncident: 'Currently Active' },
  { id: 'SYS-3', system: 'Billing Gateway', status: 'healthy', uptime: '100%', lastIncident: '45 days ago' },
  { id: 'SYS-4', system: 'Lab Information Sys', status: 'healthy', uptime: '99.95%', lastIncident: '3 days ago' },
];

const mockSlas: ITOpsDashboardData['slas'] = [
  { id: 'SLA-1', service: 'EHR API Latency', target: '< 200ms', actual: '180ms', status: 'compliant' },
  { id: 'SLA-2', service: 'PACS Image Load', target: '< 2s', actual: '2.5s', status: 'breached' },
  { id: 'SLA-3', service: 'Billing Webhook', target: '99.9%', actual: '99.85%', status: 'at_risk' },
];

const mockIncidents: ITOpsDashboardData['incidents'] = [
  { id: 'INC-2041', title: 'PACS Retrieval Latency', severity: 'high', status: 'assigned', assignedTeam: 'Storage Ops', timeOpen: '45m' },
  { id: 'INC-2040', title: 'LDAP Auth Delay', severity: 'medium', status: 'mitigated', assignedTeam: 'IAM Team', timeOpen: '2h 15m' },
];

const mockAlerts: ITOpsDashboardData['alerts'] = [
  { id: 'A1', type: 'sla_breach', message: 'SLA Breach: PACS Image Load Time > 2s threshold for last 30 mins.', severity: 'critical', timestamp: new Date().toISOString() },
  { id: 'A2', type: 'escalation', message: 'INC-2041 escalated to Tier 3 Storage Engineers.', severity: 'high', timestamp: new Date(Date.now() - 900000).toISOString() },
];

/* ── API Service ───────────────────────────────────────── */

export const itOpsApi = {
  getDashboardSummary: async (filters: ITOpsFilters) => ({
    data: {
      kpis: mockKpis,
      health: mockHealth,
      slas: mockSlas,
      incidents: mockIncidents,
      alerts: mockAlerts,
    } as ITOpsDashboardData,
    message: 'Success', status: 200,
  }),
};
