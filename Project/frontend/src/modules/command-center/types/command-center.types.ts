export interface Incident {
  id: string;
  type: string;
  severity: string;
  status: string;
}

export interface Command {
  id: string;
  target_system: string;
  action: string;
  payload: Record<string, any>;
  status: string;
}

export interface OperationalEvent {
  id: string;
  event_type: string;
  source: string;
  payload: Record<string, any>;
}

export interface ControlSession {
  id: string;
  operator_id: string;
  started_at: string;
  ended_at: string | null;
}
