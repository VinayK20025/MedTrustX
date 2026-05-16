/**
 * MedTrustX — Infection Control Officer (Role 103) Types
 */

export type InfectionStatus = 'Active' | 'Resolved' | 'Under Investigation';
export type OutbreakStatus = 'Suspected' | 'Confirmed' | 'Contained';
export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Pending' | 'Overdue';

export interface InfectionControlKPI {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface InfectionCase {
  id: string;
  patientTag: string;
  ward: string;
  infectionType: string; // MRSA, C.diff, VRE, SSI
  status: InfectionStatus;
  reportedAt: string;
  labConfirmed: boolean;
  isolated: boolean;
}

export interface WardInfectionSummary {
  wardId: string;
  wardName: string;
  activeCases: number;
  infectionRate: number; // per 1000 patient days
  status: 'Normal' | 'Elevated' | 'Outbreak';
}

export interface OutbreakCluster {
  id: string;
  ward: string;
  pathogen: string;
  caseCount: number;
  status: OutbreakStatus;
  detectedAt: string;
  containmentSteps: { step: number; label: string; done: boolean }[];
}

export interface HygieneAudit {
  id: string;
  area: string;
  ward: string;
  score: number; // 0-100
  status: 'Pass' | 'Fail' | 'Pending';
  auditedAt: string;
  findings: string;
}

export interface ComplianceProtocol {
  id: string;
  protocol: string;
  department: string;
  status: ComplianceStatus;
  lastCheckedAt: string;
}

export interface InfectionControlDashboardData {
  kpis: InfectionControlKPI[];
  cases: InfectionCase[];
  wardSummaries: WardInfectionSummary[];
  outbreaks: OutbreakCluster[];
  audits: HygieneAudit[];
  protocols: ComplianceProtocol[];
}
