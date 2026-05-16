import { apiGet, apiPost } from '@/services/api';
import type { ConfigDashboardData, GlobalConfig, FeatureFlag } from '../types/config.types';

const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockConfigs: GlobalConfig[] = [
  { id: 'CFG-001', key: 'max_patient_session_timeout', value: '3600', type: 'number', scope: 'Global', description: 'Maximum session duration in seconds for patient portal.', lastUpdated: t(5), updatedBy: 'Admin (sys)' },
  { id: 'CFG-002', key: 'api_gateway_burst_limit', value: '1000', type: 'number', scope: 'Global', description: 'Rate limiting burst capacity for API Gateway.', lastUpdated: t(1), updatedBy: 'DevOps-Bot' },
  { id: 'CFG-003', key: 'enable_v3_telemetry', value: 'true', type: 'boolean', scope: 'Global', description: 'Global toggle for the new telemetry pipeline.', lastUpdated: t(12), updatedBy: 'CTO Office' },
];

const mockFlags: FeatureFlag[] = [
  { id: 'FLG-101', name: 'New CDSS Engine', key: 'clinical_decision_v2', status: 'Gradual Rollout', percentage: 25, environment: 'Production' },
  { id: 'FLG-102', name: 'Dark Mode UI', key: 'ui_dark_mode', status: 'Enabled', environment: 'Production' },
  { id: 'FLG-103', name: 'AI Image Analysis', key: 'ai_imaging_beta', status: 'Disabled', environment: 'Production' },
];

const mockData: ConfigDashboardData = {
  metrics: {
    totalConfigs: 452,
    activeFeatureFlags: 12,
    pendingOverrides: 3,
    configHealthScorePercent: 99.2,
    lastDeploymentTime: t(0.5)
  },
  recentConfigs: mockConfigs,
  featureFlags: mockFlags,
  recentAudits: [
    { id: 'AUD-882', timestamp: t(0.1), user: 'Elena Rostova', action: 'Updated', key: 'api_gateway_burst_limit', oldValue: '500', newValue: '1000' },
    { id: 'AUD-881', timestamp: t(1), user: 'System Bot', action: 'Created', key: 'new_tenant_quota', newValue: '50GB' }
  ]
};

export const configApi = {
  getDashboardData: async (): Promise<{ data: ConfigDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: ConfigDashboardData }>('/api/v1/config/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateFlag: async (flagId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/config/flags/${flagId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Flag updated (Mock)', status: 200 };
    }
  }
};
