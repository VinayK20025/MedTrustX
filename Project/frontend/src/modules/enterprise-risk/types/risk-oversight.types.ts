export interface Risk {
  id: string;
  category: string;
  description: string;
  severity: string;
  status: string;
}

export interface RiskAssessment {
  id: string;
  risk_id: string;
  score: number;
  likelihood: number;
  impact: number;
  assessed_at: string;
}

export interface MitigationPlan {
  id: string;
  risk_id: string;
  actions: Record<string, any>;
  status: string;
}

export interface RiskEvent {
  id: string;
  risk_id: string;
  event_type: string;
  details: Record<string, any>;
}
