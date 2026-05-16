/**
 * MedTrustX — External Auditor (Role 135) Types
 * Independent compliance evaluation, checklist-driven audits, and evidence-linked findings.
 */

export interface AuditorKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface Audit {
  id: string;
  title: string;
  scope: string;
  standard: 'NABH' | 'JCI' | 'Internal' | 'ISO 9001';
  status: 'Planning' | 'Active' | 'Report Draft' | 'Completed';
  department: string;
  startDate: string;
  complianceScore: number;
  findingsCount: number;
}

export interface AuditCheckItem {
  id: string;
  criteria: string;
  standard: string;
  status: 'Compliant' | 'Non-Compliant' | 'Partial' | 'Not Assessed';
  evidenceLinked: boolean;
}

export interface AuditFinding {
  id: string;
  issue: string;
  severity: 'Critical' | 'Major' | 'Minor' | 'Observation';
  department: string;
  status: 'Open' | 'Action Planned' | 'Closed';
  evidenceRef?: string;
}

export interface AuditorData {
  kpis: AuditorKPI[];
  audits: Audit[];
  checklist: AuditCheckItem[];
  findings: AuditFinding[];
}
