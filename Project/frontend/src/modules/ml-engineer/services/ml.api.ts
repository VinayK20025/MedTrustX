import type { MlEngineerData } from '../types/ml.types';

const t = (sec: number) => new Date(Date.now() + sec * 1000).toISOString();

const mockData: MlEngineerData = {
  metrics: {
    modelsDeployed: 8,
    totalInferencesToday: 1_240_000,
    avgAccuracy: 91.4,
    trainingJobsRunning: 2,
    activeDriftAlerts: 1,
    avgInferenceLatency: 45,
  },
  models: [
    { id: 'MDL-001', name: 'Clinical Risk Predictor', version: 'v3.2', type: 'Risk Prediction', status: 'Deployed', framework: 'XGBoost', accuracy: 92.4, deployedAt: t(-86400 * 5), endpoint: '/api/v1/predict/risk', latencyMs: 32, requestsToday: 42_000 },
    { id: 'MDL-002', name: 'Sepsis Early Warning', version: 'v2.1', type: 'Anomaly Detection', status: 'Deployed', framework: 'PyTorch', accuracy: 89.8, deployedAt: t(-86400 * 12), endpoint: '/api/v1/predict/sepsis', latencyMs: 84, requestsToday: 18_400 },
    { id: 'MDL-003', name: 'Radiology Auto-Triage', version: 'v1.0', type: 'Computer Vision', status: 'Staging', framework: 'PyTorch', accuracy: 94.2, latencyMs: 0, requestsToday: 0 },
    { id: 'MDL-004', name: 'Readmission Risk NLP', version: 'v4.0', type: 'NLP', status: 'Training', framework: 'TensorFlow', accuracy: 0, latencyMs: 0, requestsToday: 0 },
    { id: 'MDL-005', name: 'Insurance Claim Denials', version: 'v1.4', type: 'Risk Prediction', status: 'Deployed', framework: 'Scikit-Learn', accuracy: 88.5, deployedAt: t(-86400 * 45), endpoint: '/api/v1/predict/claims', latencyMs: 14, requestsToday: 8_200 },
    { id: 'MDL-006', name: 'Patient Flow Optimizer', version: 'v2.0', type: 'Recommendation', status: 'Failed', framework: 'XGBoost', accuracy: 76.2, latencyMs: 0, requestsToday: 0 },
  ],
  trainingJobs: [
    { id: 'JOB-842', modelName: 'Readmission Risk NLP', datasetName: 'Discharge Summaries 2024-2026', status: 'Running', progress: 68, epochs: 50, currentEpoch: 34, startedAt: t(-14400), estimatedTimeLeft: '2h 15m' },
    { id: 'JOB-843', modelName: 'Radiology Auto-Triage', datasetName: 'Chest X-Ray Archive v2', status: 'Completed', progress: 100, epochs: 100, currentEpoch: 100, startedAt: t(-86400), estimatedTimeLeft: '0m' },
    { id: 'JOB-844', modelName: 'Patient Flow Optimizer', datasetName: 'Hospital Operations Q1', status: 'Failed', progress: 12, epochs: 30, currentEpoch: 4, startedAt: t(-3600), estimatedTimeLeft: '--' },
  ],
  experiments: [
    { id: 'EXP-101', modelId: 'MDL-001', runName: 'baseline_v3_xgboost', accuracy: 92.4, precision: 91.2, recall: 89.8, f1Score: 90.5, timestamp: t(-86400 * 6) },
    { id: 'EXP-102', modelId: 'MDL-001', runName: 'hyperparam_tune_depth8', accuracy: 91.8, precision: 90.4, recall: 89.0, f1Score: 89.7, timestamp: t(-86400 * 7) },
    { id: 'EXP-103', modelId: 'MDL-002', runName: 'lstm_attention_v2', accuracy: 89.8, precision: 86.4, recall: 94.2, f1Score: 90.1, timestamp: t(-86400 * 14) },
    { id: 'EXP-104', modelId: 'MDL-002', runName: 'gru_baseline', accuracy: 87.2, precision: 84.1, recall: 90.5, f1Score: 87.2, timestamp: t(-86400 * 15) },
  ],
  driftMetrics: [
    { featureName: 'patient_age_normalized', driftScore: 0.12, status: 'Normal', importance: 0.85 },
    { featureName: 'systolic_bp_rolling_avg', driftScore: 0.45, status: 'Warning', importance: 0.72 },
    { featureName: 'lab_creatinine_variance', driftScore: 0.78, status: 'Critical Drift', importance: 0.64 },
    { featureName: 'prior_admissions_count', driftScore: 0.05, status: 'Normal', importance: 0.41 },
    { featureName: 'medication_change_flag', driftScore: 0.22, status: 'Normal', importance: 0.38 },
  ],
  alerts: [
    { id: 'ALT-ML-1', modelId: 'MDL-002', title: 'Data Drift Detected', severity: 'Critical', status: 'Active', detectedAt: t(-3600), detail: 'Significant drift detected in feature "lab_creatinine_variance" for Sepsis Early Warning model. Prediction confidence has dropped by 4.2%.' },
    { id: 'ALT-ML-2', modelId: 'MDL-001', title: 'Inference Latency Spike', severity: 'Warning', status: 'Acknowledged', detectedAt: t(-7200), detail: 'Clinical Risk Predictor inference latency spiked to 145ms (threshold: 100ms) for 5 minutes during batch processing.' },
  ],
};

export const mlApi = {
  getData: async () => ({ data: mockData, message: 'Success', status: 200 }),
  retrainModel: async (id: string) => ({ data: { success: true }, message: 'Retraining job queued', status: 200 }),
  acknowledgeAlert: async (id: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
