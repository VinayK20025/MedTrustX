/**
 * MedTrustX — TF Serving Service Types
 */

export type ModelStatus = 'Available' | 'Loading' | 'End of Life' | 'Unloading';
export type VersionStatus = 'Ready' | 'Loading' | 'Failed';

export interface TfModelVersion {
  version: number;
  status: VersionStatus;
  statusMessage?: string;
}

export interface TfDeployedModel {
  id: string;
  name: string;
  basePath: string;
  versions: TfModelVersion[];
  activeVersion: number;
  signatureDefs: string[];
  status: ModelStatus;
  lastUpdated: string;
}

export interface TfServingMetrics {
  inferenceRequestsPerSec: number;
  averageLatencyMs: number;
  errorRate: number;
  uptimeSeconds: number;
  activeModelCount: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
}

export interface TfServingDashboardData {
  metrics: TfServingMetrics;
  models: TfDeployedModel[];
}
