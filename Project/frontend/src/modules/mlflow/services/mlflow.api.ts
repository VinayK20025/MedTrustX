import { apiGet, apiPost, apiPut } from '@/services/api';
import type { 
  MlflowDashboardData, MlflowExperiment, 
  MlflowRun, MlflowRegisteredModel 
} from '../types/mlflow.types';

const t = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();

const mockExperiments: MlflowExperiment[] = [
  { id: 'exp-001', name: 'sepsis-prediction-v3', artifactLocation: 's3://mlflow-artifacts/sepsis-v3', status: 'Active', createdAt: t(720), lastUpdateTime: t(2), tags: { domain: 'clinical', priority: 'high' }, runCount: 142 },
  { id: 'exp-002', name: 'radiology-cnn-dx', artifactLocation: 's3://mlflow-artifacts/rad-cnn', status: 'Active', createdAt: t(1440), lastUpdateTime: t(24), tags: { domain: 'imaging', framework: 'pytorch' }, runCount: 88 },
  { id: 'exp-003', name: 'readmission-risk', artifactLocation: 's3://mlflow-artifacts/readmission', status: 'Completed', createdAt: t(2000), lastUpdateTime: t(100), tags: { domain: 'operations' }, runCount: 45 },
  { id: 'exp-004', name: 'icu-bed-forecasting', artifactLocation: 's3://mlflow-artifacts/icu-beds', status: 'Archived', createdAt: t(4000), lastUpdateTime: t(2000), tags: { domain: 'capacity' }, runCount: 12 },
];

const mockRuns: MlflowRun[] = [
  { id: 'run-88231', experimentId: 'exp-001', experimentName: 'sepsis-prediction-v3', runName: 'xgboost-hyperopt-04', status: 'Running', startTime: t(1), endTime: null, metrics: { auc: 0.942, f1: 0.88 }, params: { max_depth: 6, learning_rate: 0.01 }, tags: { env: 'training' }, user: 'alice.data' },
  { id: 'run-88230', experimentId: 'exp-001', experimentName: 'sepsis-prediction-v3', runName: 'xgboost-hyperopt-03', status: 'Completed', startTime: t(4), endTime: t(2), metrics: { auc: 0.965, f1: 0.91 }, params: { max_depth: 8, learning_rate: 0.05 }, tags: { env: 'training' }, user: 'alice.data' },
  { id: 'run-45112', experimentId: 'exp-002', experimentName: 'radiology-cnn-dx', runName: 'resnet50-transfer', status: 'Failed', startTime: t(25), endTime: t(24), metrics: { loss: 2.45 }, params: { batch_size: 128, epochs: 50 }, tags: { env: 'training' }, user: 'bob.ml' },
  { id: 'run-99100', experimentId: 'exp-003', experimentName: 'readmission-risk', runName: 'random-forest-baseline', status: 'Completed', startTime: t(105), endTime: t(104), metrics: { auc: 0.88, accuracy: 0.82 }, params: { n_estimators: 200 }, tags: { env: 'staging' }, user: 'charlie.ds' },
];

const mockModels: MlflowRegisteredModel[] = [
  { id: 'rm-01', name: 'SepsisPredictor', createdAt: t(8000), lastUpdated: t(2), description: 'Predicts sepsis onset within 6 hours.', latestVersions: [
    { version: 'v3.2.1', status: 'Ready', stage: 'Production', runId: 'run-88230', createdAt: t(2), lastUpdated: t(1), description: 'Hyperopt tuned XGBoost' },
    { version: 'v3.1.0', status: 'Ready', stage: 'Archived', runId: 'run-80000', createdAt: t(700), lastUpdated: t(2), description: 'Previous prod version' }
  ], tags: { compliance: 'approved' } },
  { id: 'rm-02', name: 'RadiologyDx', createdAt: t(5000), lastUpdated: t(24), description: 'Identifies lung nodules in CT scans.', latestVersions: [
    { version: 'v2.0.4', status: 'Ready', stage: 'Production', runId: 'run-40000', createdAt: t(500), lastUpdated: t(400), description: 'ResNet50 baseline' },
    { version: 'v2.1.0', status: 'Failed', stage: 'None', runId: 'run-45112', createdAt: t(24), lastUpdated: t(24), description: 'OOM error during build' }
  ], tags: { compliance: 'pending' } },
];

const mockData: MlflowDashboardData = {
  metrics: {
    totalExperiments: 45,
    activeRuns: 3,
    totalModels: 12,
    productionModels: 8,
    failedRunsLast24h: 1,
  },
  experiments: mockExperiments,
  recentRuns: mockRuns,
  registeredModels: mockModels,
};

export const mlflowApi = {
  getDashboardData: async (): Promise<{ data: MlflowDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: MlflowDashboardData }>('/api/v1/mlflow/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  killRun: async (runId: string) => {
    try {
      return await apiPost(`/api/v1/mlflow/runs/${runId}/kill`, {});
    } catch {
      return { data: { success: true }, message: 'Run killed (Mock)', status: 200 };
    }
  },

  transitionModelStage: async (modelName: string, version: string, stage: string) => {
    try {
      return await apiPut(`/api/v1/mlflow/models/${modelName}/versions/${version}/stage`, { stage });
    } catch {
      return { data: { success: true }, message: 'Model stage transitioned (Mock)', status: 200 };
    }
  }
};
