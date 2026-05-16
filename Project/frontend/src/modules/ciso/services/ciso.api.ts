/**
 * MedTrustX — CISO API Client
 * Zero Trust Security Operations Center data layer
 */
import type { CisoDashboardData } from '../types/ciso.types';

const BASE_URL = '/api/v1/security/ciso';

export interface CisoFilters {
  timeWindow?: '1h' | '6h' | '24h' | '7d' | '30d';
  severityFilter?: 'all' | 'critical' | 'high' | 'medium';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CisoDashboardData['kpis'] = [
  { id: '1', title: 'Active Threats', value: 7, status: 'critical', delta: '+3 (1h)', actionLabel: 'Threat Feed', actionUrl: '/dashboard/ciso/threats' },
  { id: '2', title: 'Failed Logins (24h)', value: 342, status: 'warning', delta: '+18%', actionLabel: 'Access Logs', actionUrl: '/dashboard/ciso/logs' },
  { id: '3', title: 'Privilege Escalations', value: 2, status: 'critical', delta: 'Unreviewed', actionLabel: 'Investigate', actionUrl: '/dashboard/ciso/iam' },
  { id: '4', title: 'Policy Violations', value: 14, status: 'warning', delta: '-5 vs yesterday', actionLabel: 'Violations', actionUrl: '/dashboard/ciso/compliance' },
  { id: '5', title: 'ZTA Posture Score', value: '94.2%', status: 'secure', delta: '+0.8%', actionLabel: 'Details', actionUrl: '/dashboard/ciso/compliance' },
];

const mockThreats: CisoDashboardData['threats'] = [
  { id: 'T1', type: 'brute_force', severity: 'critical', source: '192.168.12.45', target: 'Identity Service', description: 'Distributed brute-force attempt detected — 1,200+ attempts in 5 min', timestamp: new Date(Date.now() - 120000).toISOString(), status: 'active', mitreTactic: 'TA0006 - Credential Access' },
  { id: 'T2', type: 'privilege_escalation', severity: 'critical', source: 'user:dr.patel', target: 'EHR Admin API', description: 'Unexpected privilege escalation from clinician to admin scope', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'investigating', mitreTactic: 'TA0004 - Privilege Escalation' },
  { id: 'T3', type: 'data_exfiltration', severity: 'high', source: 'user:lab.tech.02', target: 'Patient Records (bulk)', description: 'Abnormal bulk export of 2,400 patient records outside normal workflow', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'investigating', mitreTactic: 'TA0010 - Exfiltration' },
  { id: 'T4', type: 'anomaly', severity: 'medium', source: 'user:nurse.sharma', target: 'Pharmacy Module', description: 'Access to restricted narcotics inventory outside assigned ward', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'active', mitreTactic: 'TA0001 - Initial Access' },
];

const mockAccessLogs: CisoDashboardData['accessLogs'] = [
  { id: 'L1', userId: 'U-1042', userName: 'Dr. R. Patel', role: 'Clinician', action: 'break_glass', resource: 'Patient #8841 (ICU)', outcome: 'flagged', ipAddress: '10.0.14.22', timestamp: new Date(Date.now() - 300000).toISOString(), riskScore: 92 },
  { id: 'L2', userId: 'U-2010', userName: 'Lab Tech 02', role: 'Lab Technician', action: 'access', resource: 'Bulk Patient Export', outcome: 'denied', ipAddress: '10.0.8.105', timestamp: new Date(Date.now() - 1800000).toISOString(), riskScore: 88 },
  { id: 'L3', userId: 'U-0501', userName: 'Admin J. Khan', role: 'System Admin', action: 'modify', resource: 'OPA Policy: abac.rego', outcome: 'success', ipAddress: '10.0.1.5', timestamp: new Date(Date.now() - 3600000).toISOString(), riskScore: 45 },
  { id: 'L4', userId: 'U-3388', userName: 'Nurse A. Sharma', role: 'Staff Nurse', action: 'access', resource: 'Pharmacy Narcotics Inventory', outcome: 'denied', ipAddress: '10.0.22.8', timestamp: new Date(Date.now() - 5400000).toISOString(), riskScore: 78 },
];

const mockCompliance: CisoDashboardData['compliance'] = [
  { id: 'C1', framework: 'HIPAA (PHI)', score: 96, target: 100, violations: 4, lastAudit: '2026-04-15', status: 'compliant' },
  { id: 'C2', framework: 'Zero Trust Posture', score: 94, target: 95, violations: 8, lastAudit: '2026-04-20', status: 'at_risk' },
  { id: 'C3', framework: 'RBAC/ABAC Audit', score: 99, target: 100, violations: 1, lastAudit: '2026-04-18', status: 'compliant' },
  { id: 'C4', framework: 'Data Encryption', score: 100, target: 100, violations: 0, lastAudit: '2026-04-19', status: 'compliant' },
];

const mockIncidents: CisoDashboardData['incidents'] = [
  { id: 'SEC-0042', title: 'Brute-force attack on Identity Service', severity: 'critical', category: 'breach', status: 'investigating', assignedTo: 'SOC Team Alpha', affectedSystems: ['Identity Service', 'Keycloak'], createdAt: new Date(Date.now() - 120000).toISOString(), ttd: 2 },
  { id: 'SEC-0041', title: 'Unauthorized bulk data export attempt', severity: 'high', category: 'unauthorized_access', status: 'contained', assignedTo: 'Data Security', affectedSystems: ['EHR Core', 'Patient Records'], createdAt: new Date(Date.now() - 1800000).toISOString(), ttd: 8, ttr: 22 },
];

const mockAlerts: CisoDashboardData['alerts'] = [
  { id: 'A1', type: 'critical', category: 'Credential Attack', message: 'Active brute-force on Identity Service — 1,200+ attempts blocked. Source: 192.168.12.45', source: 'ZTA Gateway', timestamp: new Date(Date.now() - 60000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'critical', category: 'Privilege Escalation', message: 'Clinician dr.patel gained admin API scope without authorization flow', source: 'OPA Policy Engine', timestamp: new Date(Date.now() - 600000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'warning', category: 'Data Loss Prevention', message: 'Bulk export of 2,400 patient records blocked — exceeds DLP threshold', source: 'DLP Module', timestamp: new Date(Date.now() - 1800000).toISOString(), actionRequired: true },
  { id: 'A4', type: 'warning', category: 'Access Anomaly', message: 'Nurse accessing restricted narcotics inventory outside assigned ward scope', source: 'ABAC Engine', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: false },
];

/* ── API Service ───────────────────────────────────────── */

export const cisoApi = {
  getDashboardSummary: async (filters: CisoFilters) => ({
    data: {
      kpis: mockKpis,
      threats: mockThreats,
      accessLogs: mockAccessLogs,
      compliance: mockCompliance,
      incidents: mockIncidents,
      alerts: mockAlerts,
    } as CisoDashboardData,
    message: 'Success',
    status: 200,
  }),

  blockSource: async (sourceId: string) => {
    return { data: { success: true }, message: 'Source blocked', status: 200 };
  },

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  },

  containIncident: async (incidentId: string) => {
    return { data: { success: true }, message: 'Incident contained', status: 200 };
  },

  revokeAccess: async (userId: string) => {
    return { data: { success: true }, message: 'Access revoked', status: 200 };
  },
};
