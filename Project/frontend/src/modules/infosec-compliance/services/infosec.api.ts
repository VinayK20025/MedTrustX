import type { GrcData } from '../types/infosec.types';

export interface GrcFilters { status?: string; }

const mockData: GrcData = {
  metrics: {
    overallScore: 92,
    openRisks: 5,
    activeAudits: 2,
    openIncidents: 1,
  },
  frameworks: [
    { id: 'FW-ISO', name: 'ISO 27001:2022', version: '2022', status: 'Active', complianceScore: 94, totalControls: 93, implementedControls: 87, lastAssessed: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'FW-HIPAA', name: 'HIPAA Security Rule', version: '2013', status: 'Active', complianceScore: 98, totalControls: 75, implementedControls: 74, lastAssessed: new Date(Date.now() - 15 * 86400000).toISOString() },
    { id: 'FW-NABH', name: 'NABH IT Standards', version: '5th Ed', status: 'Review Required', complianceScore: 85, totalControls: 45, implementedControls: 38, lastAssessed: new Date(Date.now() - 60 * 86400000).toISOString() },
  ],
  controls: {
    'FW-ISO': [
      { id: 'CTRL-A5.1', frameworkId: 'FW-ISO', domain: 'InfoSec Policies', title: 'Policies for information security', description: 'Information security policy shall be defined, approved by management, published and communicated.', status: 'Implemented', evidenceLinked: true, lastTested: new Date(Date.now() - 30 * 86400000).toISOString() },
      { id: 'CTRL-A8.1', frameworkId: 'FW-ISO', domain: 'Asset Management', title: 'Inventory of assets', description: 'Assets associated with information and information processing facilities shall be identified.', status: 'Partial', evidenceLinked: false, lastTested: new Date(Date.now() - 90 * 86400000).toISOString() },
    ],
    'FW-HIPAA': [
      { id: 'CTRL-164.308', frameworkId: 'FW-HIPAA', domain: 'Administrative Safeguards', title: 'Security Management Process', description: 'Implement policies and procedures to prevent, detect, contain, and correct security violations.', status: 'Implemented', evidenceLinked: true, lastTested: new Date(Date.now() - 15 * 86400000).toISOString() }
    ]
  },
  audits: [
    { id: 'AUD-001', type: 'External', scope: 'ISO 27001 Surveillance Audit', auditor: 'BSI Group', status: 'Ongoing', startDate: new Date(Date.now() - 2 * 86400000).toISOString(), findingsCount: 2 },
    { id: 'AUD-002', type: 'Internal', scope: 'Access Management Review', auditor: 'Internal Audit Team', status: 'Remediation', startDate: new Date(Date.now() - 45 * 86400000).toISOString(), endDate: new Date(Date.now() - 40 * 86400000).toISOString(), findingsCount: 5 },
  ],
  risks: [
    { id: 'RSK-001', title: 'Unpatched legacy systems in Radiology', category: 'Infrastructure', severity: 'High', status: 'Open', owner: 'IT Ops', dueDate: new Date(Date.now() + 10 * 86400000).toISOString() },
    { id: 'RSK-002', title: 'Third-party vendor VPN access not monitored', category: 'Vendor', severity: 'Medium', status: 'Open', owner: 'Network Admin', dueDate: new Date(Date.now() + 5 * 86400000).toISOString() },
  ],
  incidents: [
    { id: 'INC-992', title: 'Suspicious login attempts from foreign IP', severity: 'Medium', status: 'Investigating', dateReported: new Date(Date.now() - 3600000).toISOString(), affectedSystems: ['VPN Gateway', 'Active Directory'] }
  ]
};

export const infosecApi = {
  getDashboardData: async (f: GrcFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateControlStatus: async (controlId: string, status: string) => ({ data: { success: true }, message: 'Control updated', status: 200 }),
  addRiskEntry: async (title: string, severity: string) => ({ data: { success: true }, message: 'Risk added', status: 200 }),
};
