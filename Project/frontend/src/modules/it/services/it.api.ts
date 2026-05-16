import type {
  ItDashboardData, ItKPI, SystemHealth, ServerInfra, ItIncident, SecurityLog
} from '../types/it.types';

export interface ItFilters { systemType?: string; status?: string; }

const mockKpis: ItKPI[] = [
  { id: '1', title: 'Global Uptime', value: '99.98%', format: 'text', status: 'success' },
  { id: '2', title: 'Active Users', value: 1245, format: 'number', status: 'normal' },
  { id: '3', title: 'Critical Incidents', value: 1, format: 'number', status: 'critical' },
  { id: '4', title: 'Security Threats', value: 3, format: 'number', status: 'warning' },
];

const mockSystems: SystemHealth[] = [
  { id: 'SYS-EMR', name: 'MedTrust EMR', type: 'Clinical Core', status: 'Operational', uptimePercent: 99.9, activeUsers: 450, lastPing: new Date().toISOString() },
  { id: 'SYS-LIS', name: 'Laboratory IS', type: 'Diagnostics', status: 'Degraded', uptimePercent: 98.5, activeUsers: 85, lastPing: new Date(Date.now() - 5000).toISOString() },
  { id: 'SYS-BIL', name: 'Enterprise Billing', type: 'Financial', status: 'Operational', uptimePercent: 99.99, activeUsers: 120, lastPing: new Date().toISOString() },
  { id: 'SYS-PACS', name: 'Radiology PACS', type: 'Diagnostics', status: 'Operational', uptimePercent: 99.8, activeUsers: 45, lastPing: new Date().toISOString() },
];

const mockInfra: ServerInfra[] = [
  { id: 'SRV-DB1', hostname: 'db-master-01', role: 'Database', status: 'OK', cpuUsage: 45, memoryUsage: 65, diskUsage: 70 },
  { id: 'SRV-APP1', hostname: 'app-node-01', role: 'Application', status: 'Warning', cpuUsage: 88, memoryUsage: 72, diskUsage: 45 },
  { id: 'SRV-STG1', hostname: 'san-storage-01', role: 'Storage', status: 'OK', cpuUsage: 10, memoryUsage: 40, diskUsage: 85 },
];

const mockIncidents: ItIncident[] = [
  { id: 'INC-2023', title: 'LIS Sync Delayed', description: 'Lab results syncing to EMR with a 5-minute delay due to queue buildup.', systemAffected: 'SYS-LIS', severity: 'High', status: 'Investigating', reportedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'INC-2024', title: 'Printer Offline in OPD', description: 'Network printer unreachable in OPD Wing B.', systemAffected: 'Network', severity: 'Low', status: 'Open', reportedAt: new Date(Date.now() - 3600000).toISOString() },
];

const mockSecurityLogs: SecurityLog[] = [
  { id: 'SEC-901', timestamp: new Date(Date.now() - 300000).toISOString(), user: 'Unknown', action: 'Failed Admin Login (5x)', ipAddress: '192.168.1.105', isThreat: true },
  { id: 'SEC-902', timestamp: new Date(Date.now() - 900000).toISOString(), user: 'dr.smith', action: 'Accessed VIP Record', ipAddress: '10.0.5.22', isThreat: false },
  { id: 'SEC-903', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'System', action: 'Firewall Rule Updated', ipAddress: '10.0.0.1', isThreat: false },
];

export const itApi = {
  getDashboardSummary: async (filters: ItFilters) => ({
    data: { kpis: mockKpis, systems: mockSystems, infrastructure: mockInfra, incidents: mockIncidents, securityLogs: mockSecurityLogs } as ItDashboardData,
    message: 'Success', status: 200,
  }),
  resolveIncident: async (incidentId: string) => ({ data: { success: true }, message: 'Incident resolved', status: 200 }),
  restartServer: async (serverId: string) => ({ data: { success: true }, message: 'Server restart initiated', status: 200 }),
  blockIpAddress: async (ip: string) => ({ data: { success: true }, message: 'IP address blocked at firewall', status: 200 }),
};
