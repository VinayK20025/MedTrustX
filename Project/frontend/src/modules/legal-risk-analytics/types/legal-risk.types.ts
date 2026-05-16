export interface RiskScore {
  id: string;
  case_id: string;
  risk_level: string;
  score: number;
}

export interface RiskFactor {
  id: string;
  case_id: string;
  factor_name: string;
  impact: number;
}

export interface TrendAnalysis {
  id: string;
  category: string;
  metrics: Record<string, any>;
}

export interface PredictiveModel {
  id: string;
  model_name: string;
  version: string;
  accuracy: number;
}
