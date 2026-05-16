/**
 * MedTrustX — Clinical Researcher / Principal Investigator (Role 128) Types
 * Complex study design, protocol oversight, multi-site management, and data-driven outcomes.
 */

export interface ResearcherKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface ClinicalStudy {
  id: string;
  title: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4';
  status: 'Design' | 'Active' | 'Paused' | 'Completed';
  targetEnrollment: number;
  currentEnrollment: number;
  adverseEvents: number;
  progress: number; // percentage
}

export interface ProtocolInsight {
  id: string;
  metric: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  significance: 'high' | 'medium' | 'low';
}

export interface ComplianceApproval {
  id: string;
  board: string;
  status: 'Approved' | 'Pending Review' | 'Rejected';
  validUntil: string;
}

export interface ResearcherData {
  kpis: ResearcherKPI[];
  studies: ClinicalStudy[];
  insights: ProtocolInsight[];
  approvals: ComplianceApproval[];
}
