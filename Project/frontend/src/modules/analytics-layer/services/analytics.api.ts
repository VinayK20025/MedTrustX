import { apiGet, apiPost, apiPut } from '@/services/api';
import type { 
  AnalyticsLayerData, 
  DataPipeline, 
  DataSource, 
  AnalyticQuery, 
  AnalyticsDashboard 
} from '../types/analytics.types';

const timeStr = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();

const mockDataSources: DataSource[] = [
  { id: 'DS-001', name: 'Clinical EHR DB', type: 'PostgreSQL', connectionStatus: 'Connected', lastSync: timeStr(5), dataSizeMB: 840500, totalRecords: 145000000, ingestionRatePerSec: 120 },
  { id: 'DS-002', name: 'IoT Vitals Stream', type: 'Kafka', connectionStatus: 'Connected', lastSync: timeStr(0), dataSizeMB: 124000, totalRecords: 800000000, ingestionRatePerSec: 4500 },
  { id: 'DS-003', name: 'Financial Data Warehouse', type: 'ClickHouse', connectionStatus: 'Connected', lastSync: timeStr(2), dataSizeMB: 3200000, totalRecords: 500000000, ingestionRatePerSec: 350 },
  { id: 'DS-004', name: 'Imaging Metadata', type: 'S3', connectionStatus: 'Degraded', lastSync: timeStr(120), dataSizeMB: 15600000, totalRecords: 2500000, ingestionRatePerSec: 0 },
  { id: 'DS-005', name: 'External Lab FHIR', type: 'HL7_FHIR', connectionStatus: 'Disconnected', lastSync: timeStr(1440), dataSizeMB: 45000, totalRecords: 1200000, ingestionRatePerSec: 0 },
];

const mockPipelines: DataPipeline[] = [
  { id: 'PL-001', name: 'EHR to ClickHouse Sync', type: 'ETL_Batch', source: 'Clinical EHR DB', destination: 'Analytics DWH', status: 'Running', lastRunTime: timeStr(10), recordsProcessed: 45000, errorRate: 0.01, owner: 'DataEng Team' },
  { id: 'PL-002', name: 'Vitals Stream Aggregation', type: 'Real_Time_Stream', source: 'IoT Vitals Stream', destination: 'ClickHouse', status: 'Running', lastRunTime: timeStr(0), recordsProcessed: 12000000, errorRate: 0.00, owner: 'Platform Team' },
  { id: 'PL-003', name: 'Daily Billing Extract', type: 'ETL_Batch', source: 'Billing DB', destination: 'S3 Data Lake', status: 'Completed', lastRunTime: timeStr(360), recordsProcessed: 850000, errorRate: 0.00, owner: 'Finance Analytics' },
  { id: 'PL-004', name: 'Patient Risk ML Prep', type: 'ML_Prep', source: 'Analytics DWH', destination: 'Model Feature Store', status: 'Failed', lastRunTime: timeStr(45), recordsProcessed: 12000, errorRate: 14.5, owner: 'DataSci Team' },
  { id: 'PL-005', name: 'Legacy HIS Archive Sync', type: 'Data_Sync', source: 'Legacy HIS', destination: 'S3 Archive', status: 'Paused', lastRunTime: timeStr(4320), recordsProcessed: 0, errorRate: 0.0, owner: 'IT Ops' },
];

const mockRecentQueries: AnalyticQuery[] = [
  { id: 'Q-9812', queryName: 'Monthly Revenue Rollup', user: 'cfo_admin', status: 'Success', executionTimeMs: 1450, bytesProcessed: 45000000, startTime: timeStr(12) },
  { id: 'Q-9813', queryName: 'ICU Bed Occupancy Real-time', user: 'cno_dashboard_svc', status: 'Running', executionTimeMs: 800, bytesProcessed: 1200000, startTime: timeStr(0) },
  { id: 'Q-9814', queryName: 'Sepsis Risk Predictor Batch', user: 'ml_pipeline_svc', status: 'Failed', executionTimeMs: 45000, bytesProcessed: 890000000, startTime: timeStr(45) },
  { id: 'Q-9815', queryName: 'Inventory Shortage Forecast', user: 'supply_chain_lead', status: 'Success', executionTimeMs: 3200, bytesProcessed: 150000000, startTime: timeStr(120) },
  { id: 'Q-9816', queryName: 'Ad-hoc: ER Wait Times', user: 'cmo_admin', status: 'Queued', executionTimeMs: 0, bytesProcessed: 0, startTime: timeStr(1) },
];

const mockDashboards: AnalyticsDashboard[] = [
  { id: 'DB-01', title: 'Executive KPI Overview', category: 'Executive', viewsLast7Days: 145, lastUpdated: timeStr(1440), status: 'Published' },
  { id: 'DB-02', title: 'ER Throughput & Triage', category: 'Clinical', viewsLast7Days: 450, lastUpdated: timeStr(60), status: 'Published' },
  { id: 'DB-03', title: 'Revenue Cycle Analysis', category: 'Financial', viewsLast7Days: 85, lastUpdated: timeStr(2880), status: 'Published' },
  { id: 'DB-04', title: 'Predictive Staffing Model', category: 'Operational', viewsLast7Days: 12, lastUpdated: timeStr(5), status: 'Draft' },
  { id: 'DB-05', title: 'Legacy Billing Reports', category: 'Financial', viewsLast7Days: 2, lastUpdated: timeStr(43200), status: 'Deprecated' },
];

const mockAnalyticsLayerData: AnalyticsLayerData = {
  metrics: {
    totalPipelines: 18,
    activePipelines: 12,
    failedPipelines: 1,
    dataIngestedTB: 45.2,
    avgQueryLatencyMs: 340,
    activeUsers: 84,
    computeCostMonthToDate: 12450.00,
  },
  pipelines: mockPipelines,
  dataSources: mockDataSources,
  recentQueries: mockRecentQueries,
  dashboards: mockDashboards,
};

export const analyticsApi = {
  getDashboardData: async (): Promise<{ data: AnalyticsLayerData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: AnalyticsLayerData }>('/api/v1/analytics/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockAnalyticsLayerData, message: 'Mock data used', status: 200 };
    }
  },

  restartPipeline: async (pipelineId: string) => {
    try {
      return await apiPost(`/api/v1/analytics/pipelines/${pipelineId}/restart`, {});
    } catch {
      return { data: { success: true }, message: 'Pipeline restart initiated (Mock)', status: 200 };
    }
  },

  pausePipeline: async (pipelineId: string) => {
    try {
      return await apiPost(`/api/v1/analytics/pipelines/${pipelineId}/pause`, {});
    } catch {
      return { data: { success: true }, message: 'Pipeline paused (Mock)', status: 200 };
    }
  },

  cancelQuery: async (queryId: string) => {
    try {
      return await apiPut(`/api/v1/analytics/queries/${queryId}/cancel`, {});
    } catch {
      return { data: { success: true }, message: 'Query cancelled (Mock)', status: 200 };
    }
  }
};
