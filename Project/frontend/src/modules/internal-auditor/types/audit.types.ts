/**
 * MedTrustX — Internal Auditor (Role 150) Types
 * Continuous control assurance, compliance mapping, findings, and CAPA management.
 */

export type Domain = 'Clinical' | 'Financial' | 'IT' | 'Operational' | 'HR';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Standard = 'ISO 27001' | 'NABH' | 'HIPAA' | 'Internal Policy' | 'JCI';

export interface AuditControl {
  id: string;
  title: string;
  domain: Domain;
  description: string;
  status: 'Active' | 'Inactive' | 'Under Review';
  lastTested: string;
  effectiveness: 'Effective' | 'Partially Effective' | 'Ineffective';
  mappedStandards: Standard[];
}

export interface AuditCycle {
  id: string;
  title: string;
  scope: string;
  domain: Domain;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Overdue';
  startDate: string;
  endDate?: string;
  auditor: string;
  findingsCount: number;
}

export interface ComplianceMapping {
  controlId: string;
  controlTitle: string;
  standard: Standard;
  clause: string;
  status: 'Compliant' | 'Non-Compliant' | 'Partial' | 'Not Applicable';
  lastVerified: string;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  title: string;
  description: string;
  domain: Domain;
  severity: Severity;
  status: 'Open' | 'In Remediation' | 'Closed' | 'Accepted';
  controlRef: string;
  dateRaised: string;
  owner: string;
}

export interface CapaAction {
  id: string;
  findingId: string;
  action: string;
  rootCause: string;
  owner: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Validation Pending' | 'Closed';
}

export interface AuditMetrics {
  auditsCompleted: number;
  openFindings: number;
  capaCompletionRate: number;
  overallComplianceScore: number;
  criticalFindings: number;
}

export interface AuditData {
  metrics: AuditMetrics;
  controls: AuditControl[];
  audits: AuditCycle[];
  mappings: ComplianceMapping[];
  findings: AuditFinding[];
  capas: Record<string, CapaAction[]>; // keyed by findingId
}
