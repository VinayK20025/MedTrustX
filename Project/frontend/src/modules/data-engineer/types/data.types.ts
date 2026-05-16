/**
 * MedTrustX — Data Engineer (Role 157) Types
 * ETL/ELT pipelines, data sources, lineage, quality validation, and monitoring.
 */

export type PipelineStatus = 'Running' | 'Success' | 'Failed' | 'Queued' | 'Paused';
export type ScheduleType = 'Real-time' | 'Hourly' | 'Daily' | 'Weekly' | 'On-demand';
export type DataSourceStatus = 'Connected' | 'Degraded' | 'Disconnected';
export type QualityRuleStatus = 'Passed' | 'Failed' | 'Warning';

export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  sourceSystem: string;
  targetSystem: string;
  type: 'ETL' | 'ELT' | 'Stream' | 'Batch';
  status: PipelineStatus;
  schedule: ScheduleType;
  lastRunAt: string;
  durationSeconds: number;
  recordsProcessed: number;
  errorCount: number;
  successRate: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'EHR' | 'LIS' | 'PACS' | 'Billing' | 'IoMT' | 'External' | 'Warehouse';
  status: DataSourceStatus;
  latencyMs: number;
  recordsToday: number;
  lastSyncAt: string;
  encryption: boolean;
}

export interface LineageNode {
  id: string;
  label: string;
  type: 'source' | 'transform' | 'destination';
  system: string;
}

export interface QualityRule {
  id: string;
  pipelineId: string;
  rule: string;
  description: string;
  status: QualityRuleStatus;
  failCount: number;
  lastChecked: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  type: 'Encryption' | 'Access Control' | 'Masking' | 'Audit Log' | 'Retention';
  status: 'Enabled' | 'Disabled';
  scope: string;
  lastAudit: string;
}

export interface PipelineAlert {
  id: string;
  pipelineId: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Firing' | 'Acknowledged' | 'Resolved';
  firedAt: string;
  detail: string;
}

export interface DataLogEntry {
  id: string;
  timestamp: string;
  pipelineId: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface DataMetrics {
  pipelinesActive: number;
  pipelineSuccessRate: number;
  totalRecordsToday: number;
  tbProcessedToday: number;
  avgLatencyMs: number;
  failedPipelines: number;
  openAlerts: number;
}

export interface DataEngineerData {
  metrics: DataMetrics;
  pipelines: DataPipeline[];
  sources: DataSource[];
  qualityRules: QualityRule[];
  securityPolicies: SecurityPolicy[];
  alerts: PipelineAlert[];
  logs: DataLogEntry[];
}
