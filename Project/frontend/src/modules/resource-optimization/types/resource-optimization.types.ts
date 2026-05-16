export interface Resource {
  id: string;
  resource_type: string;
  status: string;
  metadata: Record<string, any>;
}

export interface Allocation {
  id: string;
  resource_id: string;
  assigned_to: string;
  start_time: string;
  end_time: string | null;
  status: string;
}

export interface OptimizationRun {
  id: string;
  run_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

export interface OptimizationResult {
  id: string;
  run_id: string;
  result: Record<string, any>;
}
