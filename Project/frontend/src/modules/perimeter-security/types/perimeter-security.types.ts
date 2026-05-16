export interface PerimeterZone {
  id: string;
  name: string;
  boundary: Record<string, any>;
}

export interface Sensor {
  id: string;
  zone_id: string;
  sensor_type: string;
  status: string;
}

export interface IntrusionEvent {
  id: string;
  zone_id: string;
  event_type: string;
  severity: string;
}

export interface ResponseAction {
  id: string;
  event_id: string;
  action_type: string;
  status: string;
  triggered_at: string;
}
