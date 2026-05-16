/**
 * MedTrustX — CCO Module Types
 * Compliance Intelligence & Audit Orchestration domain models
 */

export interface CcoKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'compliant' | 'warning' | 'non_compliant' | 'neutral';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface AuditRecord {
  id: string;
  title: string;
  type: 'internal' | 'external' | 'regulatory';
  department: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  auditor: string;
  scheduledDate: string;
  completedDate?: string;
  findingsCount: number;
  score?: number;
}

export interface Violation {
  id: string;
  title: string;
  category: 'clinical' | 'financial' | 'operational' | 'documentation' | 'safety';
  severity: 'critical' | 'major' | 'minor';
  department: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved';
  assignedTo?: string;
  detectedAt: string;
  dueDate: string;
  description: string;
}

export interface RiskArea {
  id: string;
  area: string;
  riskLevel: 'high' | 'medium' | 'low';
  complianceScore: number;
  openViolations: number;
  lastAudit: string;
}

export interface DocComplianceItem {
  id: string;
  category: string;
  totalRequired: number;
  totalCompleted: number;
  completionRate: number;
  status: 'complete' | 'partial' | 'overdue';
}

export interface CcoAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  department?: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface CcoDashboardData {
  kpis: CcoKPI[];
  audits: AuditRecord[];
  violations: Violation[];
  riskAreas: RiskArea[];
  docCompliance: DocComplianceItem[];
  alerts: CcoAlert[];
}
