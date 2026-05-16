export interface ModelEntity {
  id: string;
  name: string;
  version: string;
  status: string;
}

export interface ModelDecision {
  id: string;
  model_id: string;
  input: Record<string, any>;
  output: Record<string, any>;
  decision: string;
  created_at: string;
}

export interface ExplainabilityReport {
  id: string;
  model_id: string;
  explanation: Record<string, any>;
}

export interface BiasMetric {
  id: string;
  model_id: string;
  metric_name: string;
  value: number;
}

export interface GovernancePolicy {
  id: string;
  policy_name: string;
  rules: Record<string, any>;
}
