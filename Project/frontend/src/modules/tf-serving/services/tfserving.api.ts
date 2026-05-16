import { apiGet, apiPost } from '@/services/api';
import type { TfServingDashboardData, TfDeployedModel } from '../types/tfserving.types';

const t = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString();

const mockModels: TfDeployedModel[] = [
  { 
    id: 'tfm-001', 
    name: 'SepsisRealTime', 
    basePath: '/models/sepsis', 
    versions: [
      { version: 12, status: 'Ready' },
      { version: 11, status: 'Ready' }
    ], 
    activeVersion: 12, 
    signatureDefs: ['serving_default', 'predict'], 
    status: 'Available', 
    lastUpdated: t(5) 
  },
  { 
    id: 'tfm-002', 
    name: 'ChestXRayClassifier', 
    basePath: '/models/chest_xray', 
    versions: [
      { version: 5, status: 'Ready' },
      { version: 6, status: 'Loading' }
    ], 
    activeVersion: 5, 
    signatureDefs: ['classify'], 
    status: 'Available', 
    lastUpdated: t(60) 
  },
  { 
    id: 'tfm-003', 
    name: 'ReadmissionForecaster', 
    basePath: '/models/readmission', 
    versions: [
      { version: 1, status: 'Failed', statusMessage: 'Out of Memory' }
    ], 
    activeVersion: 0, 
    signatureDefs: [], 
    status: 'Unloading', 
    lastUpdated: t(1440) 
  }
];

const mockData: TfServingDashboardData = {
  metrics: {
    inferenceRequestsPerSec: 125.4,
    averageLatencyMs: 42.5,
    errorRate: 0.02,
    uptimeSeconds: 1209600,
    activeModelCount: 2,
    cpuUsagePercent: 34.2,
    memoryUsageMb: 2450
  },
  models: mockModels
};

export const tfServingApi = {
  getDashboardData: async (): Promise<{ data: TfServingDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: TfServingDashboardData }>('/api/v1/tf-serving/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  reloadModel: async (modelName: string) => {
    try {
      return await apiPost(`/api/v1/tf-serving/models/${modelName}/reload`, {});
    } catch {
      return { data: { success: true }, message: 'Model reload requested (Mock)', status: 200 };
    }
  }
};
