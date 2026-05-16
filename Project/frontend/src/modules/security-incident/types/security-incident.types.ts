export interface Incident {
  id: string;
  type: string;
  severity: string;
  status: string;
  location: string;
}

export interface IncidentAction {
  id: string;
  incident_id: string;
  action_type: string;
  status: string;
  performed_at: string;
}

export interface Responder {
  id: string;
  user_id: string;
  role: string;
  status: string;
  assigned_at: string;
}

export interface IncidentLog {
  id: string;
  incident_id: string;
  event_type: string;
  payload: Record<string, any>;
}
