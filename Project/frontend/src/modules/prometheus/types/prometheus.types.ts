export interface MetricSeries {
  id: string;
  metric_name: string;
  labels: Record<string, string>;
  value: number;
  timestamp: string;
}

export interface AlertRule {
  id: string;
  rule_name: string;
  expression: string;
  severity: string;
}

export interface AlertEvent {
  id: string;
  rule_id: string;
  status: string;
  triggered_at: string;
}
