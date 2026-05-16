export interface Project {
  id: string;
  repo_id: string;
  name: string;
}

export interface Analysis {
  id: string;
  project_id: string;
  status: string;
  score: number;
}

export interface CodeIssue {
  id: string;
  project_id: string;
  severity: string;
  type: string;
  description: string;
}

export interface QualityGate {
  id: string;
  project_id: string;
  status: string;
  evaluated_at: string;
}
