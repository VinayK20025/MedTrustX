import type { SocData } from '../types/soc-analyst.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: SocData = {
  metrics: {
    alertsPerHour: 425,
    activeIncidents: 12,
    mttdMinutes: 4.2,
    mttrMinutes: 18.5,
    threatIntelHits: 8,
  },
  alerts: [
    { id: 'ALT-SIEM-001', ruleName: 'Multiple Failed Logins (VPN)', source: '192.168.45.10', severity: 'High', timestamp: t(-120), status: 'Unassigned', description: 'User jdoe triggered 15 failed login attempts within 2 minutes.' },
    { id: 'ALT-SIEM-002', ruleName: 'Data Exfiltration (EHR)', source: '10.12.5.55', severity: 'Critical', timestamp: t(-300), status: 'Investigating', description: 'Mass export of patient records (>10,000) detected from non-standard endpoint.' },
    { id: 'ALT-SIEM-003', ruleName: 'Malware Signature Detected', source: 'WKST-NURSE-04', severity: 'High', timestamp: t(-3600), status: 'Closed', description: 'Endpoint Agent blocked known ransomware hash execution.' },
    { id: 'ALT-SIEM-004', ruleName: 'Impossible Travel', source: 'IAM-OAUTH', severity: 'Medium', timestamp: t(-4000), status: 'Unassigned', description: 'Login from NYC and Tokyo within 30 minutes.' },
  ],
  incidents: [
    { id: 'INC-2023-094', title: 'Suspected EHR Data Exfiltration', status: 'Investigating', severity: 'Critical', assignedTo: 'Analyst_Smith', createdTime: t(-3600), lastUpdated: t(-120), relatedAlerts: ['ALT-SIEM-002'] },
    { id: 'INC-2023-095', title: 'VPN Brute Force Campaign', status: 'New', severity: 'High', assignedTo: 'Unassigned', createdTime: t(-180), lastUpdated: t(-180), relatedAlerts: ['ALT-SIEM-001'] },
    { id: 'INC-2023-093', title: 'Ransomware Dropper Blocked', status: 'Contained', severity: 'High', assignedTo: 'Analyst_Doe', createdTime: t(-86400), lastUpdated: t(-3600), relatedAlerts: ['ALT-SIEM-003'] },
  ],
  logs: [
    { id: 'LOG-001', incidentId: 'INC-2023-094', logSource: 'EHR', eventAction: 'Batch Export', rawLog: 'ACTION=EXPORT REQ=API_KEY_99 ROWS=14500 IP=10.12.5.55', timestamp: t(-300) },
    { id: 'LOG-002', incidentId: 'INC-2023-094', logSource: 'Firewall', eventAction: 'Outbound Connection', rawLog: 'SRC=10.12.5.55 DST=45.33.22.11 PORT=443 BYTES=4.2GB', timestamp: t(-280) },
    { id: 'LOG-003', incidentId: 'INC-2023-095', logSource: 'IAM', eventAction: 'Auth Failed', rawLog: 'USER=jdoe IP=192.168.45.10 RESULT=BAD_PASS', timestamp: t(-120) },
  ],
  threats: [
    { id: 'IOC-01', indicatorValue: '45.33.22.11', type: 'IP Address', riskScore: 98, lastSeen: t(-280), threatIntelSource: 'CrowdStrike Falcon' },
    { id: 'IOC-02', indicatorValue: '192.168.45.10', type: 'IP Address', riskScore: 75, lastSeen: t(-120), threatIntelSource: 'Internal Honeypot' },
    { id: 'IOC-03', indicatorValue: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', type: 'File Hash', riskScore: 100, lastSeen: t(-3600), threatIntelSource: 'VirusTotal' },
  ],
  playbooks: [
    { id: 'PB-01', incidentId: 'INC-2023-094', actionName: 'Block IP on Firewall', status: 'Available' },
    { id: 'PB-02', incidentId: 'INC-2023-094', actionName: 'Revoke API Key', status: 'Executed', executedBy: 'Analyst_Smith', timestamp: t(-200) },
    { id: 'PB-03', incidentId: 'INC-2023-095', actionName: 'Force Password Reset (jdoe)', status: 'Executing' },
  ]
};

export const socAnalystApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  executePlaybook: async (playbookId: string) => ({ data: { success: true }, message: 'Playbook Execution Started', status: 200 }),
  updateIncidentStatus: async (incidentId: string, status: string) => ({ data: { success: true }, message: `Incident marked as ${status}`, status: 200 }),
  assignAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert Assigned to You', status: 200 }),
};
