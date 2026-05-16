/**
 * MedTrustX — MLflow Service Types
 */

export type ExperimentStatus = 'Active' | 'Completed' | 'Archived';
export type RunStatus = 'Running' | 'Completed' | 'Failed' | 'Killed';
export type ModelStage = 'None' | 'Staging' | 'Production' | 'Archived';

export interface MlflowExperiment {
  id: string;
  name: string;
  artifactLocation: string;
  status: ExperimentStatus;
  createdAt: string;
  lastUpdateTime: string;
  tags: Record<string, string>;
  runCount: number;
}

export interface MlflowRun {
  id: string;
  experimentId: string;
  experimentName: string;
  runName: string;
  status: RunStatus;
  startTime: string;
  endTime: string | null;
  metrics: Record<string, number>;
  params: Record<string, string | number>;
  tags: Record<string, string>;
  user: string;
}

export interface MlflowModelVersion {
  version: string;
  status: 'Ready' | 'Building' | 'Failed';
  stage: ModelStage;
  runId: string;
  createdAt: string;
  lastUpdated: string;
  description: string;
}

export interface MlflowRegisteredModel {
  id: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
  description: string;
  latestVersions: MlflowModelVersion[];
  tags: Record<string, string>;
}

export interface MlflowMetrics {
  totalExperiments: number;
  activeRuns: number;
  totalModels: number;
  productionModels: number;
  failedRunsLast24h: number;
}

export interface MlflowDashboardData {
  metrics: MlflowMetrics;
  experiments: MlflowExperiment[];
  recentRuns: MlflowRun[];
  registeredModels: MlflowRegisteredModel[];
}
