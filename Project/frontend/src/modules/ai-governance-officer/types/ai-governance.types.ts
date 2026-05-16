/**
 * MedTrustX — AI Governance Officer Types
 * Lifecycle approvals, ethical/compliant AI usage, model governance, audits.
 */

export type ModelStatus = 'Active' | 'Under Review' | 'Rejected' | 'Archived' | 'Pending Approval';
export type RiskSeverity = 'High' | 'Medium' | 'Low';
export type ComplianceStatus = 'Compliant' | 'At Risk' | 'Non-Compliant';

export interface GovernanceModel {
  id: string;
  name: string;
  version: string;
  department: string;
  status: ModelStatus;
  approvalDate?: string;
  riskSeverity: RiskSeverity;
  biasScore: number; // 0 to 1, higher is better/fairer
  accuracy: number;
}

export interface BiasMetric {
  demographic: string;
  metric: string;
  disparity: number;
  status: 'Detected' | 'Clear' | 'Warning';
}

export interface ComplianceRegulation {
  id: string;
  name: string; // e.g., GDPR Article 22, HIPAA Safe Harbor, EU AI Act
  status: ComplianceStatus;
  lastAuditDate: string;
  issuesCount: number;
}

export interface GovernanceRisk {
  id: string;
  riskName: string;
  severity: RiskSeverity;
  status: 'Open' | 'Mitigating' | 'Resolved';
  affectedModelId: string;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  modelId: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface GovernanceMetrics {
  totalModels: number;
  pendingApprovals: number;
  complianceScore: number;
  biasIncidents: number;
  openRisks: number;
}

export interface AiGovernanceData {
  metrics: GovernanceMetrics;
  models: GovernanceModel[];
  biasMetrics: Record<string, BiasMetric[]>;
  regulations: ComplianceRegulation[];
  risks: GovernanceRisk[];
  auditLogs: AuditLogEntry[];
}
