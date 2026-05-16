/**
 * MedTrustX — AI Platform Module Public API
 */
export { AiPlatformDashboard } from './pages/AiPlatformDashboard';

// Components (for composing into role-specific dashboards)
export { AiModelRegistryPanel }    from './components/AiModelRegistryPanel';
export { CdssAlertsPanel }         from './components/CdssAlertsPanel';
export { TrainingJobsPanel }       from './components/TrainingJobsPanel';
export { DigitalTwinPanel }        from './components/DigitalTwinPanel';
export { AnalyticsPipelinesPanel } from './components/AnalyticsPipelinesPanel';
export { GovernancePanel }         from './components/GovernancePanel';

// Hooks
export {
  useAiPlatformDashboard,
  useAiModels,
  useRetrainModel,
  useDeployModel,
  useTrainingJobs,
  useCancelTrainingJob,
  useCdssAlerts,
  useAcknowledgeCdssAlert,
  useResolveCdssAlert,
  useDigitalTwins,
  useSyncDigitalTwin,
  useAnalyticsPipelines,
  useTriggerPipeline,
  useFeatureStore,
  useGovernanceRecords,
  useApproveGovernance,
  useRejectGovernance,
  useAiPlatformMetrics,
} from './hooks/useAiPlatform';

// Types
export type {
  AiModel,
  AiModelStatus,
  AiModelType,
  AiModelDomain,
  TrainingJob,
  TrainingStatus,
  CdssAlert,
  CdssAlertSeverity,
  CdssAlertType,
  DigitalTwin,
  TwinStatus,
  AnalyticsPipeline,
  PipelineStatus,
  FeatureStoreEntry,
  GovernanceRecord,
  AiPlatformMetrics,
  AiPlatformDashboardData,
  PredictedEvent,
  InferenceLog,
  BiasStatus,
} from './types';
