/**
 * MedTrustX — AI Platform Service Types
 * Unified intelligence hub for clinical AI, ML operations, CDSS, governance, and analytics.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────
export type AiModelStatus = 'Deployed' | 'Staging' | 'Training' | 'Deprecated' | 'Failed' | 'Pending Approval';
export type AiModelType = 'Classification' | 'Regression' | 'NLP' | 'Computer Vision' | 'Time Series' | 'Reinforcement Learning' | 'Generative';
export type AiModelDomain = 'Clinical' | 'Radiology' | 'Pharmacy' | 'Operations' | 'Security' | 'Finance' | 'Epidemiology';
export type BiasStatus = 'Clean' | 'Under Review' | 'Bias Detected' | 'Mitigated';
export type TrainingStatus = 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
export type CdssAlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type CdssAlertType = 'Drug Interaction' | 'Clinical Warning' | 'Diagnostic Suggestion' | 'Protocol Deviation' | 'Risk Score';
export type TwinStatus = 'Synced' | 'Drifted' | 'Offline' | 'Simulating';
export type PipelineStatus = 'Running' | 'Idle' | 'Failed' | 'Paused';

// ─── AI Model ─────────────────────────────────────────────────────────────────
export interface AiModel {
  id: string;
  name: string;
  version: string;
  domain: AiModelDomain;
  type: AiModelType;
  status: AiModelStatus;
  accuracy: number;           // 0–100
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  inferenceLatencyMs: number;
  inferencesLast24h: number;
  trainingDataSize: number;   // samples
  lastRetrained: string;      // ISO date
  nextRetrainDue: string;
  biasStatus: BiasStatus;
  explainabilityScore: number; // 0–100 (SHAP coverage)
  governanceApproved: boolean;
  riskScore: number;           // 0–10
  owner: string;
  endpoint: string;
  tags: string[];
  driftScore: number;          // 0–1 (0 = no drift)
  alertsActive: number;
}

// ─── Training Job ─────────────────────────────────────────────────────────────
export interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  status: TrainingStatus;
  progress: number;           // 0–100
  startedAt: string;
  estimatedCompletionAt: string;
  gpuUtilization: number;
  cpuUtilization: number;
  memoryUsedGb: number;
  epochsCurrent: number;
  epochsTotal: number;
  lossValue: number;
  validationAccuracy: number;
  triggeredBy: string;        // 'scheduled' | 'drift' | 'manual'
  datasetVersion: string;
  notes: string;
}

// ─── CDSS Alert ───────────────────────────────────────────────────────────────
export interface CdssAlert {
  id: string;
  patientId: string;
  patientName: string;
  ward: string;
  alertType: CdssAlertType;
  severity: CdssAlertSeverity;
  message: string;
  recommendation: string;
  generatedBy: string;        // model name / rule name
  confidenceScore: number;    // 0–100
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Dismissed';
  relatedOrders: string[];
  evidenceLinks: string[];
}

// ─── Inference Log ────────────────────────────────────────────────────────────
export interface InferenceLog {
  id: string;
  modelId: string;
  modelName: string;
  requestedAt: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  statusCode: number;
  caller: string;             // service / user
  patientContext?: string;
  inputSummary: string;
  outputSummary: string;
  confidenceScore: number;
  flaggedForReview: boolean;
}

// ─── Digital Twin ─────────────────────────────────────────────────────────────
export interface DigitalTwin {
  id: string;
  entityType: 'Patient' | 'Ward' | 'Device' | 'Building' | 'Pathway';
  entityId: string;
  entityName: string;
  status: TwinStatus;
  lastSyncedAt: string;
  driftScore: number;
  stateVariables: Record<string, string | number | boolean>;
  activeSimulations: number;
  totalSimulations: number;
  predictedEvents: PredictedEvent[];
}

export interface PredictedEvent {
  id: string;
  twinId: string;
  eventType: string;
  probability: number;
  estimatedAt: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  recommendedAction: string;
}

// ─── Analytics Pipeline ───────────────────────────────────────────────────────
export interface AnalyticsPipeline {
  id: string;
  name: string;
  domain: string;
  status: PipelineStatus;
  schedule: string;           // cron expression
  lastRunAt: string;
  nextRunAt: string;
  durationSeconds: number;
  inputDatasets: string[];
  outputMetrics: string[];
  recordsProcessed: number;
  errorRate: number;
  owner: string;
}

// ─── Feature Store Entry ──────────────────────────────────────────────────────
export interface FeatureStoreEntry {
  id: string;
  name: string;
  description: string;
  domain: string;
  dataType: 'Numerical' | 'Categorical' | 'Text' | 'Image' | 'Time Series';
  freshness: string;          // e.g., 'Hourly', 'Daily'
  usedByModels: number;
  lastUpdated: string;
  owner: string;
  missingRate: number;        // 0–100
  driftDetected: boolean;
}

// ─── Model Governance Record ──────────────────────────────────────────────────
export interface GovernanceRecord {
  id: string;
  modelId: string;
  modelName: string;
  reviewType: 'Initial Approval' | 'Periodic Review' | 'Bias Audit' | 'Incident Review' | 'Decommission';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  reviewedBy: string;
  reviewedAt?: string;
  expiresAt: string;
  findings: string;
  ethicsScore: number;       // 0–100
  biasScore: number;         // 0–100 (100 = clean)
  complianceFlags: string[];
  attachments: string[];
}

// ─── Platform Metrics ─────────────────────────────────────────────────────────
export interface AiPlatformMetrics {
  totalModels: number;
  modelsDeployed: number;
  modelsInTraining: number;
  pendingGovernanceApproval: number;
  totalInferencesToday: number;
  avgInferenceLatencyMs: number;
  avgModelAccuracy: number;
  activeCdssAlerts: number;
  criticalCdssAlerts: number;
  digitalTwinsActive: number;
  digitalTwinsDrifted: number;
  analyticsJobsRunning: number;
  analyticsJobsFailed: number;
  featureStoreEntries: number;
  gpuUtilizationAvg: number;
  computeCostToday: number;   // USD
  driftAlertsActive: number;
  biasAlertsActive: number;
}

// ─── Combined Dashboard Data ──────────────────────────────────────────────────
export interface AiPlatformDashboardData {
  metrics: AiPlatformMetrics;
  models: AiModel[];
  trainingJobs: TrainingJob[];
  cdssAlerts: CdssAlert[];
  inferenceLogs: InferenceLog[];
  digitalTwins: DigitalTwin[];
  analyticsPipelines: AnalyticsPipeline[];
  featureStore: FeatureStoreEntry[];
  governanceRecords: GovernanceRecord[];
}
