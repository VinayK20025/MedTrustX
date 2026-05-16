export interface DigitalTwin {
  id: string;
  entity_id: string;
  type: string;
  state: Record<string, any>;
}

export interface TwinState {
  id: string;
  twin_id: string;
  state: Record<string, any>;
}

export interface TwinEvent {
  id: string;
  twin_id: string;
  event_type: string;
  payload: Record<string, any>;
}

export interface TwinSimulation {
  id: string;
  twin_id: string;
  simulation_type: string;
  status: string;
  started_at: string;
}
