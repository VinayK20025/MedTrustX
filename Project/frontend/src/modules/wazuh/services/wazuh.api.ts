import { apiGet, apiPost, apiPut } from '@/services/api';
import type {
  WazuhDashboardData, WazuhAgent, WazuhAlert,
  WazuhVulnerability, WazuhFimEvent, WazuhSCAResult, WazuhRule
} from '../types/wazuh.types';

/* ── Rich Mock Data ───────────────────────────────────────── */

const mockAgents: WazuhAgent[] = [
  { id: 'agt-001', name: 'ehr-app-server-01',  ip: '10.10.1.20',  os: 'Ubuntu 22.04 LTS',   version: '4.7.2', status: 'active',         group: 'Linux-Servers', lastKeepAlive: new Date(Date.now() - 30000).toISOString(),    riskScore: 62 },
  { id: 'agt-002', name: 'db-ehr-primary',     ip: '10.10.1.50',  os: 'RHEL 9.2',           version: '4.7.2', status: 'active',         group: 'Linux-Servers', lastKeepAlive: new Date(Date.now() - 15000).toISOString(),    riskScore: 78 },
  { id: 'agt-003', name: 'dc01-medtrustx',     ip: '10.10.2.10',  os: 'Windows Server 2022',version: '4.7.1', status: 'active',         group: 'Windows-DCs',   lastKeepAlive: new Date(Date.now() - 60000).toISOString(),    riskScore: 55 },
  { id: 'agt-004', name: 'radiology-ws-12',    ip: '10.10.3.112', os: 'Windows 11 Pro',      version: '4.6.0', status: 'disconnected',   group: 'Workstations',  lastKeepAlive: new Date(Date.now() - 3600000).toISOString(),  riskScore: 91 },
  { id: 'agt-005', name: 'vpn-gateway-edge',   ip: '10.0.0.5',   os: 'Ubuntu 20.04 LTS',   version: '4.7.2', status: 'active',         group: 'Network-Infra', lastKeepAlive: new Date(Date.now() - 45000).toISOString(),    riskScore: 44 },
  { id: 'agt-006', name: 'k8s-node-worker-03', ip: '10.10.5.33',  os: 'Ubuntu 22.04 LTS',   version: '4.7.2', status: 'active',         group: 'Kubernetes',    lastKeepAlive: new Date(Date.now() - 20000).toISOString(),    riskScore: 38 },
  { id: 'agt-007', name: 'legacy-billing-srv', ip: '10.10.6.80',  os: 'CentOS 7.9',         version: '4.5.4', status: 'disconnected',   group: 'Legacy',        lastKeepAlive: new Date(Date.now() - 7200000).toISOString(),  riskScore: 97 },
];

const mockAlerts: WazuhAlert[] = [
  { id: 'alt-1', timestamp: new Date(Date.now()-60000).toISOString(),   rule: { id: '5710', level: 10, description: 'sshd: Attempt to login using a non-existent user',         groups: ['authentication'], mitre: { id: 'T1110', tactic: 'Credential Access', technique: 'Brute Force' } }, agent: { id: 'agt-002', name: 'db-ehr-primary', ip: '10.10.1.50' },     data: { srcip: '185.220.101.32', dstport: '22' }, location: '/var/log/auth.log', severity: 'high',     acknowledged: false },
  { id: 'alt-2', timestamp: new Date(Date.now()-300000).toISOString(),  rule: { id: '5402', level: 12, description: 'Successful sudo to ROOT executed',                         groups: ['authentication'],                                                                                        }, agent: { id: 'agt-001', name: 'ehr-app-server-01', ip: '10.10.1.20' }, data: { user: 'deploy-svc', tty: 'pts/0' },       location: '/var/log/auth.log', severity: 'critical', acknowledged: false },
  { id: 'alt-3', timestamp: new Date(Date.now()-1800000).toISOString(), rule: { id: '550',  level: 7,  description: 'Integrity checksum changed — /etc/passwd modified',        groups: ['fim'],           mitre: { id: 'T1098', tactic: 'Persistence', technique: 'Account Manipulation' } },   agent: { id: 'agt-003', name: 'dc01-medtrustx', ip: '10.10.2.10' },     data: { file: '/etc/passwd', user: 'root' },      location: 'syscheck',          severity: 'high',     acknowledged: false },
  { id: 'alt-4', timestamp: new Date(Date.now()-3600000).toISOString(), rule: { id: '87105',level: 9,  description: 'CVE-2024-1234: OpenSSL heap buffer overflow detected',     groups: ['vulnerability'] },                                                                                       agent: { id: 'agt-007', name: 'legacy-billing-srv', ip: '10.10.6.80' }, data: { cve: 'CVE-2024-1234', pkg: 'openssl' },   location: 'vulnerability',     severity: 'critical', acknowledged: true  },
  { id: 'alt-5', timestamp: new Date(Date.now()-7200000).toISOString(), rule: { id: '31108',level: 6,  description: 'Web attack: SQL Injection attempt',                        groups: ['web'],           mitre: { id: 'T1190', tactic: 'Initial Access', technique: 'Exploit Public App' } },    agent: { id: 'agt-001', name: 'ehr-app-server-01', ip: '10.10.1.20' }, data: { srcip: '92.154.23.9', url: '/api/patients' },location: 'apache2/access.log',severity: 'medium',   acknowledged: true  },
];

const mockVulnerabilities: WazuhVulnerability[] = [
  { id: 'v-1', cve: 'CVE-2024-1234', package: 'openssl',        version: '1.1.1k',  fixedVersion: '1.1.1w',  severity: 'critical', cvss3Score: 9.8, agentId: 'agt-007', agentName: 'legacy-billing-srv', published: '2024-01-15', status: 'open' },
  { id: 'v-2', cve: 'CVE-2023-6789', package: 'linux-kernel',   version: '5.15.0',  fixedVersion: '5.15.142',severity: 'high',     cvss3Score: 7.8, agentId: 'agt-002', agentName: 'db-ehr-primary',     published: '2023-12-10', status: 'open' },
  { id: 'v-3', cve: 'CVE-2024-3456', package: 'curl',           version: '7.81.0',  fixedVersion: '8.6.0',   severity: 'medium',   cvss3Score: 5.9, agentId: 'agt-001', agentName: 'ehr-app-server-01',  published: '2024-02-05', status: 'mitigated' },
  { id: 'v-4', cve: 'CVE-2023-9876', package: 'sudo',           version: '1.9.11p3',fixedVersion: '1.9.15',  severity: 'high',     cvss3Score: 7.2, agentId: 'agt-003', agentName: 'dc01-medtrustx',     published: '2023-11-20', status: 'open' },
  { id: 'v-5', cve: 'CVE-2024-5555', package: 'log4j-core',     version: '2.14.1',  fixedVersion: '2.20.0',  severity: 'critical', cvss3Score: 10.0,agentId: 'agt-007', agentName: 'legacy-billing-srv', published: '2024-03-01', status: 'open' },
];

const mockFimEvents: WazuhFimEvent[] = [
  { id: 'fim-1', timestamp: new Date(Date.now()-1800000).toISOString(), agentId: 'agt-003', agentName: 'dc01-medtrustx',     file: '/etc/passwd',                    eventType: 'modified', md5Before: 'abc123', md5After: 'def456', user: 'root' },
  { id: 'fim-2', timestamp: new Date(Date.now()-3600000).toISOString(), agentId: 'agt-001', agentName: 'ehr-app-server-01',  file: '/opt/app/config/database.yml',   eventType: 'modified', md5Before: '111aaa', md5After: '222bbb', user: 'deploy-svc' },
  { id: 'fim-3', timestamp: new Date(Date.now()-7200000).toISOString(), agentId: 'agt-002', agentName: 'db-ehr-primary',     file: '/etc/postgresql/pg_hba.conf',    eventType: 'added',    md5After: '333ccc', user: 'postgres' },
  { id: 'fim-4', timestamp: new Date(Date.now()-86400000).toISOString(),agentId: 'agt-005', agentName: 'vpn-gateway-edge',   file: '/etc/ipsec.conf',                eventType: 'modified', md5Before: '444ddd', md5After: '555eee', user: 'root' },
];

const mockScaResults: WazuhSCAResult[] = [
  { id: 'sca-1', policyId: 'cis_ubuntu_22',  policyName: 'CIS Ubuntu 22.04 Benchmark', agentId: 'agt-001', agentName: 'ehr-app-server-01', passed: 142, failed: 18, notApplicable: 12, score: 89, lastScan: new Date(Date.now()-3600000).toISOString() },
  { id: 'sca-2', policyId: 'cis_rhel_9',     policyName: 'CIS RHEL 9 Benchmark',       agentId: 'agt-002', agentName: 'db-ehr-primary',     passed: 158, failed: 9,  notApplicable: 5,  score: 95, lastScan: new Date(Date.now()-7200000).toISOString() },
  { id: 'sca-3', policyId: 'cis_win_2022',   policyName: 'CIS Win Server 2022',         agentId: 'agt-003', agentName: 'dc01-medtrustx',     passed: 201, failed: 44, notApplicable: 21, score: 82, lastScan: new Date(Date.now()-14400000).toISOString() },
  { id: 'sca-4', policyId: 'hipaa',          policyName: 'HIPAA Security Controls',    agentId: 'agt-001', agentName: 'ehr-app-server-01', passed: 54,  failed: 6,  notApplicable: 2,  score: 90, lastScan: new Date(Date.now()-86400000).toISOString() },
];

const mockRules: WazuhRule[] = [
  { id: '5710',  level: 10, description: 'SSH brute-force attempt (non-existent user)', group: 'authentication', status: 'active',   firedCount: 1243, lastFired: new Date(Date.now()-60000).toISOString() },
  { id: '5402',  level: 12, description: 'Successful sudo to ROOT',                     group: 'authentication', status: 'active',   firedCount: 87,   lastFired: new Date(Date.now()-300000).toISOString() },
  { id: '550',   level: 7,  description: 'Integrity checksum changed',                  group: 'fim',            status: 'active',   firedCount: 34,   lastFired: new Date(Date.now()-1800000).toISOString() },
  { id: '87105', level: 9,  description: 'CVE high-severity vulnerability detected',    group: 'vulnerability',  status: 'active',   firedCount: 22,   lastFired: new Date(Date.now()-3600000).toISOString() },
  { id: '31108', level: 6,  description: 'Web attack: SQL injection pattern',           group: 'web',            status: 'active',   firedCount: 678,  lastFired: new Date(Date.now()-7200000).toISOString() },
  { id: '40111', level: 4,  description: 'Network anomaly: port scan detected',         group: 'network',        status: 'disabled', firedCount: 0 },
];

const mockKpis = {
  totalAgents: 7, activeAgents: 5, criticalAlerts: 2, highAlerts: 8,
  openVulnerabilities: 4, criticalVulnerabilities: 2, complianceScore: 89, fim24h: 14,
};

/* ── API Client ───────────────────────────────────────────── */

export const wazuhApi = {
  getDashboard: async (): Promise<{ data: WazuhDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: WazuhDashboardData }>('/api/v1/wazuh/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return {
        data: { kpis: mockKpis, agents: mockAgents, alerts: mockAlerts, vulnerabilities: mockVulnerabilities, fimEvents: mockFimEvents, scaResults: mockScaResults, rules: mockRules },
        message: 'OK (Mock)', status: 200,
      };
    }
  },

  getAlerts: async (filters?: { severity?: string; acknowledged?: boolean }) => {
    try {
      return await apiGet<{ data: WazuhAlert[] }>('/api/v1/wazuh/alerts', { params: filters });
    } catch {
      const filtered = filters?.severity ? mockAlerts.filter(a => a.severity === filters.severity) : mockAlerts;
      return { data: filtered, message: 'OK (Mock)', status: 200 };
    }
  },

  acknowledgeAlert: async (alertId: string) => {
    try {
      return await apiPut<{ data: { success: boolean } }>(`/api/v1/wazuh/alerts/${alertId}/acknowledge`, {});
    } catch {
      return { data: { success: true }, message: 'Acknowledged (Mock)', status: 200 };
    }
  },

  getVulnerabilities: async () => {
    try {
      return await apiGet<{ data: WazuhVulnerability[] }>('/api/v1/wazuh/vulnerabilities');
    } catch {
      return { data: mockVulnerabilities, message: 'OK (Mock)', status: 200 };
    }
  },

  getFimEvents: async () => {
    try {
      return await apiGet<{ data: WazuhFimEvent[] }>('/api/v1/wazuh/fim');
    } catch {
      return { data: mockFimEvents, message: 'OK (Mock)', status: 200 };
    }
  },

  getScaResults: async () => {
    try {
      return await apiGet<{ data: WazuhSCAResult[] }>('/api/v1/wazuh/sca');
    } catch {
      return { data: mockScaResults, message: 'OK (Mock)', status: 200 };
    }
  },

  getAgents: async () => {
    try {
      return await apiGet<{ data: WazuhAgent[] }>('/api/v1/wazuh/agents');
    } catch {
      return { data: mockAgents, message: 'OK (Mock)', status: 200 };
    }
  },

  restartAgent: async (agentId: string) => {
    try {
      return await apiPost<{ data: { success: boolean } }>(`/api/v1/wazuh/agents/${agentId}/restart`, {});
    } catch {
      return { data: { success: true }, message: 'Agent restarted (Mock)', status: 200 };
    }
  },
};
