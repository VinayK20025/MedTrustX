/**
 * MedTrustX — Analytics Layer Service Types
 * Defines the domain model for the hospital-wide BI, Data Warehousing, 
 * ETL pipelines, and Real-time Analytics platform.
 */

export type PipelineStatus = 'Running' | 'Failed' | 'Paused' | 'Completed' | 'Pending';
export type PipelineType = 'ETL_Batch' | 'Real_Time_Stream' | 'Data_Sync' | 'ML_Prep';
export type DataSourceType = 'PostgreSQL' | 'ClickHouse' | 'Kafka' | 'S3' | 'HL7_FHIR' | 'REST_API';
export type QueryStatus = 'Success' | 'Running' | 'Failed' | 'Queued';

export interface DataPipeline {
  id: string;
  name: string;
  type: PipelineType;
  source: string;
  destination: string;
  status: PipelineStatus;
  lastRunTime: string;
  recordsProcessed: number;
  errorRate: number; // Percentage
  owner: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  connectionStatus: 'Connected' | 'Disconnected' | 'Degraded';
  lastSync: string;
  dataSizeMB: number;
  totalRecords: number;
  ingestionRatePerSec: number;
}

export interface AnalyticQuery {
  id: string;
  queryName: string;
  user: string;
  status: QueryStatus;
  executionTimeMs: number;
  bytesProcessed: number;
  startTime: string;
}

export interface AnalyticsDashboard {
  id: string;
  title: string;
  category: 'Clinical' | 'Financial' | 'Operational' | 'Executive';
  viewsLast7Days: number;
  lastUpdated: string;
  status: 'Published' | 'Draft' | 'Deprecated';
}

export interface AnalyticsMetrics {
  totalPipelines: number;
  activePipelines: number;
  failedPipelines: number;
  dataIngestedTB: number;
  avgQueryLatencyMs: number;
  activeUsers: number;
  computeCostMonthToDate: number;
}

export interface AnalyticsLayerData {
  metrics: AnalyticsMetrics;
  pipelines: DataPipeline[];
  dataSources: DataSource[];
  recentQueries: AnalyticQuery[];
  dashboards: AnalyticsDashboard[];
}
