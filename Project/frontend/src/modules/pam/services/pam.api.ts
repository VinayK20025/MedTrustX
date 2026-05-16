import { apiGet, apiPost } from '@/services/api';
import type {
  PAMDashboardData, PAMAccount, PAMRequest, PAMSession,
  PAMLiveActivity, PAMRecording, PAMPolicy, PAMAlert, PAMKPI
} from '../types/pam.types';

export interface PAMFilters {
  timeframe?: string;
}

const mockKpis: PAMKPI[] = [
  { id: '1', title: 'Active Sessions', value: 12, format: 'number', status: 'normal', trend: 5.2, trendDirection: 'up' },
  { id: '2', title: 'Pending JIT Requests', value: 4, format: 'number', status: 'warning', actionLabel: 'Review', actionUrl: '/dashboard/pam/requests' },
  { id: '3', title: 'Suspicious Actions', value: 2, format: 'number', status: 'critical', actionLabel: 'Investigate', actionUrl: '/dashboard/pam/alerts' },
  { id: '4', title: 'Recording Coverage', value: '100%', format: 'percentage', status: 'success' },
];

const mockAccounts: PAMAccount[] = [
  { id: 'v-001', accountName: 'Administrator', system: 'Root AD Domain Controller', target: 'dc01.medtrustx.internal', protocol: 'Windows RDP', accessLevel: 'Root', owner: 'IAM Team', status: 'vaulted', lastUsed: '2026-05-12T01:00:00Z', riskScore: 90 },
  { id: 'v-002', accountName: 'postgres_admin', system: 'Core EHR Database', target: 'db-ehr-primary:5432', protocol: 'Database', accessLevel: 'DBA', owner: 'DBA Team', status: 'in_use', lastUsed: '2026-05-12T05:10:00Z', riskScore: 85 },
  { id: 'v-003', accountName: 'fw_admin', system: 'Main Firewall Console', target: '10.0.0.1', protocol: 'SSH', accessLevel: 'NetworkAdmin', owner: 'NetOps', status: 'vaulted', lastUsed: '2026-05-10T14:00:00Z', riskScore: 70 },
  { id: 'v-004', accountName: 'root', system: 'vSphere Cluster Manager', target: 'vcsa.medtrustx.internal', protocol: 'Web Console', accessLevel: 'Root', owner: 'SysAdmin', status: 'vaulted', lastUsed: '2026-05-11T09:30:00Z', riskScore: 95 },
];

const mockRequests: PAMRequest[] = [
  { id: 'REQ-01', requester: 'Admin A', department: 'IT Ops', targetAccount: 'root', targetSystem: 'Core DB Cluster', justification: 'Emergency patching CVE-2026-112', duration: '2 Hours', status: 'pending', requestedAt: new Date(Date.now() - 1800000).toISOString(), riskLevel: 'critical' },
  { id: 'REQ-02', requester: 'Dev B', department: 'Engineering', targetAccount: 'db_admin', targetSystem: 'Staging DB', justification: 'Schema migration', duration: '4 Hours', status: 'approved', requestedAt: new Date(Date.now() - 7200000).toISOString(), riskLevel: 'medium' },
];

const mockSessions: PAMSession[] = [
  { id: 'SESS-01', user: 'Admin A', targetAccount: 'root', targetSystem: 'Core DB Cluster', startTime: new Date(Date.now() - 3600000).toISOString(), duration: '01:00:23', status: 'active', connectionType: 'SSH', riskScore: 88 },
  { id: 'SESS-02', user: 'NetAdmin', targetAccount: 'admin', targetSystem: 'Network Gateway', startTime: new Date(Date.now() - 1800000).toISOString(), duration: '00:30:10', status: 'active', connectionType: 'Web', riskScore: 45 },
];

const mockLiveActivities: PAMLiveActivity[] = [
  { id: 'ACT-01', sessionId: 'SESS-01', user: 'Admin A', command: 'systemctl stop postgresql', timestamp: new Date(Date.now() - 60000).toISOString(), riskLevel: 'critical' },
  { id: 'ACT-02', sessionId: 'SESS-01', user: 'Admin A', command: 'tail -f /var/log/syslog', timestamp: new Date(Date.now() - 120000).toISOString(), riskLevel: 'info' },
  { id: 'ACT-03', sessionId: 'SESS-02', user: 'NetAdmin', command: 'configure terminal', timestamp: new Date(Date.now() - 300000).toISOString(), riskLevel: 'warning' },
];

const mockRecordings: PAMRecording[] = [
  { id: 'REC-01', sessionId: 'SESS-99', user: 'Admin B', targetSystem: 'Auth Gateway', duration: '02:15:00', date: new Date(Date.now() - 86400000).toISOString(), size: '245 MB', status: 'available', anomalyDetected: false },
  { id: 'REC-02', sessionId: 'SESS-98', user: 'Contractor X', targetSystem: 'Legacy DB', duration: '00:45:12', date: new Date(Date.now() - 172800000).toISOString(), size: '88 MB', status: 'available', anomalyDetected: true },
];

const mockPolicies: PAMPolicy[] = [
  { id: 'POL-01', name: 'JIT Access Enforcement', description: 'Require approval for all root access requests', type: 'jit_access', status: 'enabled', lastUpdated: '2026-03-01' },
  { id: 'POL-02', name: 'Global Session Recording', description: 'Record all SSH and RDP sessions', type: 'session_recording', status: 'enabled', lastUpdated: '2026-01-15' },
  { id: 'POL-03', name: 'RM -rf Filter', description: 'Block destructive commands on production DBs', type: 'command_filter', status: 'enabled', lastUpdated: '2026-04-10' },
];

const mockAlerts: PAMAlert[] = [
  { id: 'ALT-01', title: 'Unauthorized Service Stop', description: 'User Admin A attempted to stop postgresql on Core DB Cluster', severity: 'critical', source: 'SESS-01', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'active' },
  { id: 'ALT-02', title: 'Anomaly Detected in Recording', description: 'Contractor X executed 50+ DB queries per minute', severity: 'high', source: 'REC-02', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'investigating' },
];

export const pamApi = {
  getDashboardSummary: async (filters: PAMFilters) => ({
    data: {
      kpis: mockKpis,
      accounts: mockAccounts,
      requests: mockRequests,
      sessions: mockSessions,
      liveActivities: mockLiveActivities,
      recordings: mockRecordings,
      policies: mockPolicies,
      alerts: mockAlerts,
    } as PAMDashboardData,
    message: 'Success', status: 200,
  }),

  approveRequest: async (requestId: string) => ({ data: { success: true }, message: 'JIT Request approved', status: 200 }),
  rejectRequest: async (requestId: string, reason: string) => ({ data: { success: true }, message: 'JIT Request rejected', status: 200 }),
  terminateSession: async (sessionId: string) => ({ data: { success: true }, message: 'Session terminated forcefully', status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),

  getVaultAccounts: async (filters?: any) => {
    try {
      return await apiGet<{ data: PAMAccount[]; message: string; status: number }>('/api/v1/pam/vault', { params: filters });
    } catch (e) {
      return { data: mockAccounts, message: 'Success (Mock)', status: 200 };
    }
  },
  checkoutVaultAccount: async (accountId: string) => {
    try {
      return await apiPost<{ data: { success: boolean }, message: string, status: number }>(`/api/v1/pam/vault/${accountId}/checkout`, {});
    } catch (e) {
      return { data: { success: true }, message: 'Vault checked out (Mock)', status: 200 };
    }
  }
};
