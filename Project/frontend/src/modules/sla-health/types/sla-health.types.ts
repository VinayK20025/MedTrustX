export interface SlaDefinition {
  id: string;
  service_name: string;
  uptime_target: number;
  latency_target: number;
}

export interface ServiceHealth {
  id: string;
  service_name: string;
  health_score: number;
  status: string;
}

export interface SlaViolation {
  id: string;
  sla_id: string;
  violation_type: string;
  severity: string;
  detected_at: string;
}

export interface HealthEvent {
  id: string;
  service_name: string;
  event_type: string;
  payload: Record<string, any>;
}
