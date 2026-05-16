/**
 * MedTrustX — InfoSec Compliance Officer (Role 147) Types
 * GRC system for managing healthcare IT standards, audits, and risks.
 */

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  status: 'Active' | 'Review Required' | 'Deprecated';
  complianceScore: number;
  totalControls: number;
  implementedControls: number;
  lastAssessed: string;
}

export interface SecurityControl {
  id: string;
  frameworkId: string;
  domain: string;
  title: string;
  description: string;
  status: 'Implemented' | 'Partial' | 'Not Implemented' | 'Not Applicable';
  evidenceLinked: boolean;
  lastTested: string;
}

export interface SecurityAudit {
  id: string;
  type: 'Internal' | 'External';
  scope: string;
  auditor: string;
  status: 'Planned' | 'Ongoing' | 'Completed' | 'Remediation';
  startDate: string;
  endDate?: string;
  findingsCount: number;
}

export interface RiskRegisterEntry {
  id: string;
  title: string;
  category: 'Data Privacy' | 'Access Control' | 'Infrastructure' | 'Vendor';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Mitigated' | 'Accepted';
  owner: string;
  dueDate: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Investigating' | 'Contained' | 'Resolved' | 'Closed';
  dateReported: string;
  affectedSystems: string[];
}

export interface GrcMetrics {
  overallScore: number;
  openRisks: number;
  activeAudits: number;
  openIncidents: number;
}

export interface GrcData {
  metrics: GrcMetrics;
  frameworks: ComplianceFramework[];
  controls: Record<string, SecurityControl[]>; // keyed by frameworkId
  audits: SecurityAudit[];
  risks: RiskRegisterEntry[];
  incidents: SecurityIncident[];
}
