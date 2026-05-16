/**
 * MedTrustX — Compliance Governance Service Types
 */

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type AuditStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';
export type NonConformanceStatus = 'Open' | 'Mitigating' | 'Resolved' | 'Closed';

export interface ComplianceAudit {
  id: string;
  title: string;
  auditor: string;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  department: string;
  complianceScore?: number;
}

export interface RiskItem {
  id: string;
  title: string;
  category: 'Clinical' | 'Operational' | 'Financial' | 'IT/Data';
  level: RiskLevel;
  mitigationPlan: string;
  owner: string;
  lastReviewDate: string;
}

export interface NonConformance {
  id: string;
  source: string; // e.g., 'Internal Audit', 'External Inspection'
  description: string;
  severity: RiskLevel;
  status: NonConformanceStatus;
  dateFound: string;
  targetResolution: string;
}

export interface ComplianceTraining {
  id: string;
  staffName: string;
  module: string;
  completionDate: string;
  status: 'Complete' | 'Overdue' | 'In Progress';
}

export interface ComplianceMetrics {
  overallRiskScore: number;
  auditCompletionRate: number;
  openNonConformances: number;
  trainingCompliancePercent: number;
  upcomingRegulatoryDeadlines: number;
}

export interface ComplianceDashboardData {
  metrics: ComplianceMetrics;
  recentAudits: ComplianceAudit[];
  criticalRisks: RiskItem[];
  pendingNonConformances: NonConformance[];
}
