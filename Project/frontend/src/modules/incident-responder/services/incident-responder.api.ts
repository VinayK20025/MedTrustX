import type { IncidentResponderData } from '../types/incident-responder.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: IncidentResponderData = {
  metrics: {
    activeIncidents: 3,
    mttrMinutes: 22,
    containmentTimeMinutes: 8,
    recoverySuccessRate: 96.5,
    openBreaches: 1,
  },
  incidents: [
    { id: 'IR-2024-001', title: 'Ransomware Attack on Imaging Server', severity: 'Critical', phase: 'Containment', category: 'Ransomware', affectedSystems: ['PACS Server', 'Imaging Gateway', 'Radiology VLAN'], assignedTo: 'IR_Team_Alpha', createdAt: t(-7200), lastUpdated: t(-300) },
    { id: 'IR-2024-002', title: 'EHR Data Exfiltration via Compromised API Key', severity: 'Critical', phase: 'Eradication', category: 'Data Breach', affectedSystems: ['EHR API Gateway', 'Patient Index'], assignedTo: 'IR_Team_Beta', createdAt: t(-14400), lastUpdated: t(-1200) },
    { id: 'IR-2024-003', title: 'Insider Threat — Unauthorized PHI Access', severity: 'High', phase: 'Analysis', category: 'Insider Threat', affectedSystems: ['EHR Client', 'IAM'], assignedTo: 'IR_Team_Alpha', createdAt: t(-3600), lastUpdated: t(-600) },
    { id: 'IR-2024-004', title: 'Phishing Campaign Targeting Nursing Staff', severity: 'Medium', phase: 'Recovery', category: 'Phishing', affectedSystems: ['Email Gateway', 'AD'], assignedTo: 'IR_Team_Beta', createdAt: t(-86400), lastUpdated: t(-43200) },
  ],
  actions: [
    { id: 'ACT-R01', incidentId: 'IR-2024-001', actionName: 'Isolate PACS Server', type: 'Isolate Device', status: 'Done', executedBy: 'Analyst_Chen', timestamp: t(-6000) },
    { id: 'ACT-R02', incidentId: 'IR-2024-001', actionName: 'Block C2 IP (185.220.101.44)', type: 'Block IP', status: 'Done', executedBy: 'Analyst_Chen', timestamp: t(-5800) },
    { id: 'ACT-R03', incidentId: 'IR-2024-001', actionName: 'Kill Ransomware Process', type: 'Kill Process', status: 'Executing', timestamp: t(-300) },
    { id: 'ACT-R04', incidentId: 'IR-2024-002', actionName: 'Revoke Compromised API Key', type: 'Custom', status: 'Done', executedBy: 'Analyst_Park', timestamp: t(-12000) },
    { id: 'ACT-R05', incidentId: 'IR-2024-002', actionName: 'Disable Service Account SA-EXT-07', type: 'Disable Account', status: 'Pending', timestamp: t(-600) },
    { id: 'ACT-R06', incidentId: 'IR-2024-003', actionName: 'Disable User Account (dr_jones)', type: 'Disable Account', status: 'Pending', timestamp: t(-600) },
  ],
  containment: [
    { id: 'CON-01', incidentId: 'IR-2024-001', systemName: 'PACS Server', action: 'Isolate Device', status: 'Isolated', timestamp: t(-6000) },
    { id: 'CON-02', incidentId: 'IR-2024-001', systemName: 'Imaging Gateway', action: 'Quarantine System', status: 'Isolated', timestamp: t(-5900) },
    { id: 'CON-03', incidentId: 'IR-2024-001', systemName: 'Radiology VLAN', action: 'Block IP', status: 'Blocked', timestamp: t(-5800) },
    { id: 'CON-04', incidentId: 'IR-2024-002', systemName: 'EHR API Gateway', action: 'Disable Account', status: 'Pending', timestamp: t(-600) },
  ],
  recovery: [
    { id: 'REC-01', incidentId: 'IR-2024-001', serviceName: 'PACS Server', status: 'In Progress', rtoMinutes: 60, actualMinutes: undefined, timestamp: t(-300) },
    { id: 'REC-02', incidentId: 'IR-2024-002', serviceName: 'EHR API Gateway', status: 'Restored', rtoMinutes: 30, actualMinutes: 25, timestamp: t(-1200) },
    { id: 'REC-03', incidentId: 'IR-2024-002', serviceName: 'Patient Index', status: 'Verified', rtoMinutes: 30, actualMinutes: 28, timestamp: t(-900) },
    { id: 'REC-04', incidentId: 'IR-2024-004', serviceName: 'Email Gateway', status: 'Restored', rtoMinutes: 120, actualMinutes: 90, timestamp: t(-43200) },
    { id: 'REC-05', incidentId: 'IR-2024-004', serviceName: 'Active Directory', status: 'Verified', rtoMinutes: 120, actualMinutes: 110, timestamp: t(-42000) },
  ],
  forensics: [
    { id: 'FOR-01', incidentId: 'IR-2024-001', artifactType: 'Memory Dump', status: 'Analyzing', hash: 'sha256:a1b2c3d4e5f6...', timestamp: t(-5500) },
    { id: 'FOR-02', incidentId: 'IR-2024-001', artifactType: 'Malware Sample', status: 'Collected', hash: 'sha256:f6e5d4c3b2a1...', timestamp: t(-5400) },
    { id: 'FOR-03', incidentId: 'IR-2024-002', artifactType: 'Network Capture', status: 'Analyzed', hash: 'sha256:1122334455...', timestamp: t(-13000) },
    { id: 'FOR-04', incidentId: 'IR-2024-002', artifactType: 'Log Bundle', status: 'Preserved', hash: 'sha256:6677889900...', timestamp: t(-12500) },
  ],
  playbooks: [
    { id: 'PB-S01', incidentId: 'IR-2024-001', stepName: 'Detect & Classify Threat', order: 1, status: 'Done' },
    { id: 'PB-S02', incidentId: 'IR-2024-001', stepName: 'Isolate Affected Systems', order: 2, status: 'Done' },
    { id: 'PB-S03', incidentId: 'IR-2024-001', stepName: 'Block C2 Communication', order: 3, status: 'Done' },
    { id: 'PB-S04', incidentId: 'IR-2024-001', stepName: 'Kill Malicious Processes', order: 4, status: 'In Progress' },
    { id: 'PB-S05', incidentId: 'IR-2024-001', stepName: 'Restore from Clean Backup', order: 5, status: 'Pending' },
    { id: 'PB-S06', incidentId: 'IR-2024-001', stepName: 'Validate System Integrity', order: 6, status: 'Pending' },
  ]
};

export const incidentResponderApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  executeAction: async (actionId: string) => ({ data: { success: true }, message: 'Action Executed', status: 200 }),
  updatePhase: async (incidentId: string, phase: string) => ({ data: { success: true }, message: `Phase updated to ${phase}`, status: 200 }),
  containSystem: async (incidentId: string, system: string) => ({ data: { success: true }, message: 'System Contained', status: 200 }),
};
