/**
 * MedTrustX — AI / ML Engineer (Role 159) Types
 * Model development, deployment, drift monitoring, and experiment tracking.
 */

export type ModelStatus = 'Deployed' | 'Training' | 'Staging' | 'Archived' | 'Failed';
export type ModelType = 'Risk Prediction' | 'Anomaly Detection' | 'NLP' | 'Computer Vision' | 'Recommendation';

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: ModelType;
  status: ModelStatus;
  framework: 'PyTorch' | 'TensorFlow' | 'XGBoost' | 'Scikit-Learn';
  accuracy: number;
  deployedAt?: string;
  endpoint?: string;
  latencyMs: number;
  requestsToday: number;
}

export interface TrainingJob {
  id: string;
  modelName: string;
  datasetName: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Queued';
  progress: number;
  epochs: number;
  currentEpoch: number;
  startedAt: string;
  estimatedTimeLeft?: string;
}

export interface ExperimentRun {
  id: string;
  modelId: string;
  runName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  timestamp: string;
}

export interface ModelDriftMetric {
  featureName: string;
  driftScore: number;       // 0 to 1, higher is worse
  status: 'Normal' | 'Warning' | 'Critical Drift';
  importance: number;       // Feature importance in the model
}

export interface MLAlert {
  id: string;
  modelId: string;
  title: string;
  severity: 'Critical' | 'High' | 'Warning';
  status: 'Active' | 'Acknowledged';
  detectedAt: string;
  detail: string;
}

export interface MLMetrics {
  modelsDeployed: number;
  totalInferencesToday: number;
  avgAccuracy: number;
  trainingJobsRunning: number;
  activeDriftAlerts: number;
  avgInferenceLatency: number;
}

export interface MlEngineerData {
  metrics: MLMetrics;
  models: MLModel[];
  trainingJobs: TrainingJob[];
  experiments: ExperimentRun[];
  driftMetrics: ModelDriftMetric[];
  alerts: MLAlert[];
}
