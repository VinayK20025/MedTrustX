/**
 * MedTrustX — Risk Management Service Types
 */

export type RiskLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Extreme';
export type RiskStatus = 'Identified' | 'Assessed' | 'Mitigating' | 'Accepted' | 'Residual';
export type RiskCategory = 'Clinical' | 'Financial' | 'Operational' | 'Strategic' | 'Compliance' | 'Reputational';

export interface RiskEntry {
  id: string;
  category: RiskCategory;
  level: RiskLevel;
  status: RiskStatus;
  title: string;
  description: string;
  inherentScore: number;
  residualScore: number;
  owner: string;
}

export interface RiskAssessment {
  id: string;
  riskId: string;
  assessedAt: string;
  assessor: string;
  impact: number;
  likelihood: number;
  score: number;
}

export interface MitigationPlan {
  id: string;
  riskId: string;
  strategy: 'Avoid' | 'Transfer' | 'Mitigate' | 'Accept';
  actions: { description: string; status: 'Open' | 'Completed'; dueDate: string }[];
  budgetAllocated: number;
}

export interface RiskMetrics {
  totalRisksInRegister: number;
  extremeRisksCount: number;
  overdueMitigationActions: number;
  averageRiskReductionPercent: number;
  insuranceCoverageAdequacyPercent: number;
}

export interface RiskDashboardData {
  metrics: RiskMetrics;
  topRisks: RiskEntry[];
  pendingAssessments: RiskEntry[];
  mitigationOverview: MitigationPlan[];
}
