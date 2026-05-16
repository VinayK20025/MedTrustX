export interface Workflow {
  id: string;
  name: string;
  definition: Record<string, any>;
  status: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface Task {
  id: string;
  workflow_id: string; // Refers to run ID
  task_type: string;
  payload: Record<string, any>;
  status: string;
}

export interface Bot {
  id: string;
  name: string;
  type: string;
  status: string;
}
