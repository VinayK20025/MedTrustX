import type { RiskData, SecurityRisk } from '../types/infosec-risk.types';

export interface RiskFilters { status?: string; level?: string; }

const mockData: RiskData = {
  metrics: {
    totalRisks: 24,
    highRiskCount: 6,
    mitigatedRisks: 14,
    mitigationProgress: 80,
    residualRiskScore: 12,
  },
  risks: [
    {
      id: 'RSK-101', title: 'Ransomware Attack on EHR', description: 'Unpatched endpoints in radiology and pharmacy could be exploited by ransomware, encrypting patient records.', category: 'Infrastructure',
      impact: 5, likelihood: 4, severityScore: 20, riskLevel: 'Critical', status: 'Mitigating',
      dateIdentified: new Date(Date.now() - 10 * 86400000).toISOString(), owner: 'IT Security Team',
    },
    {
      id: 'RSK-102', title: 'Unauthorized PHI Access via Shared Credentials', description: 'Multiple clinical staff sharing login credentials for legacy systems, creating audit gaps and PHI exposure risk.', category: 'Human Element',
      impact: 4, likelihood: 4, severityScore: 16, riskLevel: 'High', status: 'Open',
      dateIdentified: new Date(Date.now() - 5 * 86400000).toISOString(), owner: 'CISO Office',
    },
    {
      id: 'RSK-103', title: 'Unencrypted Data Transfer via Email', description: 'Lab reports transmitted via unencrypted email to third-party specialists bypassing secure file exchange portals.', category: 'Data Privacy',
      impact: 4, likelihood: 3, severityScore: 12, riskLevel: 'High', status: 'Open',
      dateIdentified: new Date(Date.now() - 20 * 86400000).toISOString(), owner: 'Data Privacy Officer',
    },
    {
      id: 'RSK-104', title: 'Third-Party Vendor with Excessive Access', description: 'Biomedical equipment vendor retains VPN access post-service, creating a persistent unauthorized access vector.', category: 'Vendor',
      impact: 3, likelihood: 3, severityScore: 9, riskLevel: 'Medium', status: 'Mitigating',
      dateIdentified: new Date(Date.now() - 30 * 86400000).toISOString(), owner: 'Vendor Management',
    },
    {
      id: 'RSK-105', title: 'Outdated TLS on Patient Portal', description: 'Patient portal API endpoints still accept TLS 1.0 connections, vulnerable to POODLE/BEAST attacks.', category: 'Application',
      impact: 3, likelihood: 2, severityScore: 6, riskLevel: 'Medium', status: 'Open',
      dateIdentified: new Date(Date.now() - 45 * 86400000).toISOString(), owner: 'Application Security',
    },
    {
      id: 'RSK-106', title: 'Missing MFA on Admin Consoles', description: 'Critical admin consoles for AD and firewall management lack multi-factor authentication enforcement.', category: 'Infrastructure',
      impact: 5, likelihood: 2, severityScore: 10, riskLevel: 'High', status: 'Open',
      dateIdentified: new Date(Date.now() - 3 * 86400000).toISOString(), owner: 'IT Ops',
    },
  ],
  mitigations: {
    'RSK-101': [
      { id: 'MIT-001', riskId: 'RSK-101', action: 'Deploy EDR on all radiology workstations', assignee: 'IT Ops', dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), status: 'In Progress' },
      { id: 'MIT-002', riskId: 'RSK-101', action: 'Implement offline backup strategy for EHR data', assignee: 'DB Admin', dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), status: 'Pending' },
    ],
    'RSK-102': [
      { id: 'MIT-003', riskId: 'RSK-102', action: 'Force unique credential assignment for all legacy system users', assignee: 'IAM Team', dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), status: 'Pending' },
    ],
  },
  assets: {
    'RSK-101': [
      { id: 'ASSET-01', name: 'Epic EHR System', type: 'Software', criticality: 'High' },
      { id: 'ASSET-02', name: 'Radiology Workstations', type: 'Hardware', criticality: 'High' },
    ],
    'RSK-103': [
      { id: 'ASSET-03', name: 'Internal SMTP Server', type: 'Network', criticality: 'Medium' },
    ],
  },
  incidents: {
    'RSK-101': [
      { id: 'INC-001', title: 'Ransomware Alert on Pharmacy PC (Contained)', date: new Date(Date.now() - 60 * 86400000).toISOString(), impactScale: 'Localized' },
    ],
  },
};

export const riskApi = {
  getDashboardData: async (f: RiskFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateRiskStatus: async (riskId: string, status: string) => ({ data: { success: true }, message: 'Risk updated', status: 200 }),
  addMitigation: async (riskId: string, action: string, assignee: string) => ({ data: { success: true }, message: 'Mitigation added', status: 200 }),
};
