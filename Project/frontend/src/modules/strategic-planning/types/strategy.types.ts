export interface StrategicPlan {
  id: string;
  name: string;
  horizon: string;
  status: string;
}

export interface Objective {
  id: string;
  plan_id: string;
  objective_name: string;
  target_value: number;
}

export interface Initiative {
  id: string;
  plan_id: string;
  initiative_name: string;
  status: string;
}

export interface Forecast {
  id: string;
  plan_id: string;
  metric_name: string;
  predicted_value: number;
}
