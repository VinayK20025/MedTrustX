/**
 * MedTrustX — AI Ethics Specialist Types
 * Responsible AI, Bias Mitigation, Transparency & Clinical Safety Oversight.
 */

export type RiskLevel = 'High' | 'Medium' | 'Low';
export type ReviewStatus = 'Approved' | 'Review Required' | 'Blocked' | 'Under Audit';
export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Pending Review';

export interface EvaluatedModel {
  id: string;
  name: string;
  department: string;
  clinicalUse: string;
  riskLevel: RiskLevel;
  reviewStatus: ReviewStatus;
  lastAudited: string;
  humanInTheLoop: boolean;
}

export interface BiasMetric {
  category: 'Gender' | 'Age' | 'Ethnicity' | 'Socioeconomic';
  metricName: string; // e.g., "Disparate Impact", "Equal Opportunity Difference"
  score: number; // 0 to 1, usually > 0.8 is acceptable
  threshold: number;
  status: 'Pass' | 'Fail' | 'Warning';
}

export interface ExplainabilityFeature {
  feature: string;
  impact: 'High' | 'Medium' | 'Low';
  shapValue: number;
  isClinicallyValid: boolean;
}

export interface RiskAssessment {
  riskType: string;
  description: string;
  severity: RiskLevel;
  mitigationStrategy: string;
  status: 'Mitigated' | 'Active' | 'Investigating';
}

export interface ComplianceStandard {
  standard: string;
  description: string;
  status: ComplianceStatus;
  lastChecked: string;
  evidenceId?: string;
}

export interface EthicsAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
  timestamp: string;
  modelId: string;
  actionRequired: boolean;
}

export interface AiEthicsMetrics {
  totalModelsMonitored: number;
  biasAlertsActive: number;
  complianceScore: number; // percentage
  highRiskModels: number;
  explainabilityCoverage: number; // percentage of models with XAI
}

export interface AiEthicsData {
  metrics: AiEthicsMetrics;
  models: EvaluatedModel[];
  biasMetrics: Record<string, BiasMetric[]>; // Keyed by modelId
  explainabilityData: Record<string, ExplainabilityFeature[]>; // Keyed by modelId
  risks: RiskAssessment[];
  compliance: ComplianceStandard[];
  alerts: EthicsAlert[];
}
