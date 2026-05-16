export interface Alert {
  id: string;
  source: string;
  type: string;
  severity: string;
  payload: Record<string, any>;
}

export interface CorrelatedIncident {
  id: string;
  incident_key: string;
  root_cause: string | null;
  severity: string;
  status: string;
}

export interface AlertMapping {
  id: string;
  alert_id: string;
  incident_id: string;
  correlation_score: number;
}

export interface SuppressionRule {
  id: string;
  rule_name: string;
  conditions: Record<string, any>;
}
