import type {
  AppSupportDashboardData, AppSupportKPI, AppHealth, AppIncident
} from '../types/appsupport.types';

export interface AppSupportFilters { app?: string; severity?: string; }

const mockKpis: AppSupportKPI[] = [
  { id: '1', title: 'Open Incidents', value: 3, format: 'number', status: 'warning' },
  { id: '2', title: 'Major Incidents', value: 1, format: 'number', status: 'critical' },
  { id: '3', title: 'MTTR', value: '17m', format: 'time', status: 'success' },
  { id: '4', title: 'Failed Jobs', value: 12, format: 'number', status: 'warning' },
];

const mockHealth: AppHealth[] = [
  { appId: 'APP-EMR', name: 'MedTrust EMR', status: 'Healthy', responseTimeMs: 240, errorRatePercent: 0.1, throughput: 1200 },
  { appId: 'APP-LIS', name: 'Laboratory IS', status: 'Critical', responseTimeMs: 1400, errorRatePercent: 4.5, throughput: 300 },
  { appId: 'APP-BIL', name: 'Billing Engine', status: 'Warning', responseTimeMs: 600, errorRatePercent: 1.2, throughput: 850 },
  { appId: 'APP-RIS', name: 'Radiology IS', status: 'Healthy', responseTimeMs: 180, errorRatePercent: 0.0, throughput: 450 },
];

const mockIncidents: AppIncident[] = [
  {
    id: 'INC-8891',
    title: 'HL7 Feed Stuck in LIS',
    appAffected: 'Laboratory IS',
    severity: 'Sev 1',
    status: 'Investigating',
    firstSeenAt: new Date(Date.now() - 900000).toISOString(),
    description: 'Lab results are not syncing to the EMR. HL7 message queue depth is currently at 1,400 and growing. Suspected listener timeout.',
    affectedUsersCount: 145,
    affectedDepartments: ['ICU', 'ER', 'OPD'],
    failedTransactionsCount: 1400,
    recentRelease: { version: 'v4.8.2', deployedAt: new Date(Date.now() - 3600000).toISOString(), riskLevel: 'High' },
    traces: [
      { id: 'TRC-1', timestamp: new Date(Date.now() - 900000).toISOString(), level: 'WARN', message: 'HL7 Listener connection reset by peer', service: 'LIS.Integration' },
      { id: 'TRC-2', timestamp: new Date(Date.now() - 850000).toISOString(), level: 'ERROR', message: 'Timeout waiting for EMR Ack', service: 'LIS.QueueMgr' },
      { id: 'TRC-3', timestamp: new Date(Date.now() - 800000).toISOString(), level: 'FATAL', message: 'Queue maximum depth reached. Dropping payload.', service: 'LIS.QueueMgr' },
    ]
  },
  {
    id: 'INC-8892',
    title: 'Billing Rule Engine Misfire',
    appAffected: 'Billing Engine',
    severity: 'Sev 3',
    status: 'New',
    firstSeenAt: new Date(Date.now() - 3600000).toISOString(),
    description: 'Duplicate charges applied for MRI contrasts.',
    affectedUsersCount: 12,
    affectedDepartments: ['Billing'],
    failedTransactionsCount: 38,
    traces: [
      { id: 'TRC-4', timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'ERROR', message: 'UniqueConstraintViolation on ChargeCapture', service: 'Billing.RuleEngine' },
    ]
  }
];

export const appSupportApi = {
  getDashboardSummary: async (filters: AppSupportFilters) => ({
    data: { kpis: mockKpis, healthGrid: mockHealth, incidents: mockIncidents } as AppSupportDashboardData,
    message: 'Success', status: 200,
  }),
  updateIncidentStatus: async (incidentId: string, status: string) => ({ data: { success: true }, message: `Incident marked as ${status}`, status: 200 }),
  restartService: async (serviceName: string) => ({ data: { success: true }, message: `${serviceName} restart initiated`, status: 200 }),
  rollbackRelease: async (version: string) => ({ data: { success: true }, message: `Rollback of ${version} triggered`, status: 200 }),
};
