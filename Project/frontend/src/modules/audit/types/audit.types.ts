// Domain Models for Audit Service

export type AuditStatus = 'Completed' | 'In Progress' | 'Planned' | 'Overdue';
export type AuditDomain = 'IT' | 'Clinical' | 'Financial' | 'HR' | 'Operations' | 'Compliance';
export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type FindingStatus = 'Open' | 'In Remediation' | 'Closed' | 'On Hold';
export type ControlStatus = 'Active' | 'Under Review' | 'Inactive' | 'Proposed';
export type ControlEffectiveness = 'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Tested';
export type ComplianceStatus = 'Compliant' | 'Partial' | 'Non-Compliant' | 'Not Applicable';
export type CapaStatus = 'Open' | 'In Progress' | 'Completed' | 'Closed' | 'On Hold';

export interface AuditKPI {
  label: string;
  value: number | string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export interface AuditControl {
  id: string;
  title: string;
  domain: AuditDomain;
  description: string;
  status: ControlStatus;
  lastTested: string;
  effectiveness: ControlEffectiveness;
  mappedStandards: string[];
  owner?: string;
  frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'On-Demand';
  testMethod?: string;
}

export interface Audit {
  id: string;
  title: string;
  scope: string;
  domain: AuditDomain;
  status: AuditStatus;
  startDate: string;
  endDate?: string;
  auditor: string;
  findingsCount: number;
  type?: 'Internal' | 'External' | 'Regulatory';
  schedule?: 'Scheduled' | 'Ad-hoc' | 'Follow-up';
}

export interface StandardMapping {
  controlId: string;
  controlTitle: string;
  standard: string; // e.g., 'ISO 27001', 'NABH', 'JCI', 'HIPAA'
  clause: string;
  status: ComplianceStatus;
  lastVerified: string;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  title: string;
  description: string;
  domain: AuditDomain;
  severity: FindingSeverity;
  status: FindingStatus;
  controlRef: string;
  dateRaised: string;
  owner: string;
  rootCause?: string;
  targetDate?: string;
  evidence?: string[];
}

export interface CapaAction {
  id: string;
  findingId: string;
  action: string;
  rootCause: string;
  owner: string;
  dueDate: string;
  status: CapaStatus;
  actualCompletionDate?: string;
  evidence?: string[];
}

export interface AuditDashboardData {
  kpis: AuditKPI[];
  controls: AuditControl[];
  audits: Audit[];
  mappings: StandardMapping[];
  findings: AuditFinding[];
  capas: Record<string, CapaAction[]>;
  summary?: {
    totalControls: number;
    activeAudits: number;
    openFindings: number;
    overallScore: number;
  };
}

export interface AuditFilters {
  domain?: AuditDomain;
  status?: string;
  severity?: FindingSeverity;
  standard?: string;
  dateRange?: [string, string];
  auditor?: string;
}

export interface AuditMutationPayload {
  [key: string]: unknown;
}
