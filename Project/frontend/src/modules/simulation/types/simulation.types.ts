export interface Simulation {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface Scenario {
  id: string;
  simulation_id: string;
  parameters: Record<string, any>;
}

export interface SimulationResult {
  id: string;
  simulation_id: string;
  result: Record<string, any>;
  generated_at: string;
}

export interface SimulationEvent {
  id: string;
  simulation_id: string;
  event_type: string;
  payload: Record<string, any>;
}
