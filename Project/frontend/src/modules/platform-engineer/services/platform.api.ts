import type {
  PlatformDashboardData, PlatformKPI, K8sCluster, K8sNode, K8sWorkload,
  PlatformMetric, PlatformAlert
} from '../types/platform.types';

export interface PlatformFilters {
  clusterId?: string;
  namespace?: string;
}

const mockKpis: PlatformKPI[] = [
  { id: '1', title: 'Clusters Health', value: '100%', format: 'percentage', status: 'success' },
  { id: '2', title: 'Active Pods', value: 342, format: 'number', status: 'normal' },
  { id: '3', title: 'Nodes Ready', value: '24/24', format: 'text', status: 'success' },
  { id: '4', title: 'Critical Alerts', value: 1, format: 'number', status: 'critical', actionLabel: 'View Alerts', actionUrl: '/dashboard/platform-engineer/alerts' },
];

const mockClusters: K8sCluster[] = [
  { id: 'CLUS-PROD-EAST', name: 'us-east-prod-01', environment: 'Production', version: 'v1.28.3', nodes: { total: 16, ready: 16 }, status: 'Healthy' },
  { id: 'CLUS-STG-EAST', name: 'us-east-stg-01', environment: 'Staging', version: 'v1.29.1', nodes: { total: 8, ready: 8 }, status: 'Healthy' },
];

const mockNodes: K8sNode[] = [
  { id: 'NODE-01', clusterId: 'CLUS-PROD-EAST', name: 'ip-10-0-1-52.ec2.internal', role: 'Worker', status: 'Ready', cpuUsage: 68, memoryUsage: 82 },
  { id: 'NODE-02', clusterId: 'CLUS-PROD-EAST', name: 'ip-10-0-1-53.ec2.internal', role: 'Worker', status: 'Ready', cpuUsage: 45, memoryUsage: 60 },
  { id: 'NODE-CP-01', clusterId: 'CLUS-PROD-EAST', name: 'ip-10-0-0-10.ec2.internal', role: 'Control Plane', status: 'Ready', cpuUsage: 20, memoryUsage: 45 },
];

const mockWorkloads: K8sWorkload[] = [
  { id: 'WL-1', namespace: 'clinical-core', name: 'ehr-api-service', type: 'Deployment', pods: { desired: 12, current: 12, ready: 12, restarts: 0 }, status: 'Running' },
  { id: 'WL-2', namespace: 'telemetry', name: 'device-ingestion-gateway', type: 'Deployment', pods: { desired: 8, current: 8, ready: 6, restarts: 12 }, status: 'CrashLoopBackOff' },
  { id: 'WL-3', namespace: 'auth', name: 'iam-broker', type: 'Deployment', pods: { desired: 4, current: 4, ready: 4, restarts: 0 }, status: 'Running' },
];

const mockMetrics: PlatformMetric[] = [
  { timestamp: new Date().toISOString(), clusterId: 'CLUS-PROD-EAST', cpuUtilization: 58, memoryUtilization: 72, networkIngress: 450, networkEgress: 820, apiLatency: 45 },
];

const mockAlerts: PlatformAlert[] = [
  { id: 'ALT-1', clusterId: 'CLUS-PROD-EAST', namespace: 'telemetry', resource: 'device-ingestion-gateway', type: 'PodCrashLoop', severity: 'critical', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'Pods in CrashLoopBackOff. Liveness probe failed on port 8080.' },
  { id: 'ALT-2', clusterId: 'CLUS-PROD-EAST', namespace: 'clinical-core', resource: 'ehr-db-0', type: 'OOMKilled', severity: 'warning', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'Active', message: 'Pod OOMKilled. Consider increasing memory requests/limits.' },
];

export const platformApi = {
  getDashboardSummary: async (filters: PlatformFilters) => ({
    data: {
      kpis: mockKpis,
      clusters: mockClusters,
      nodes: mockNodes,
      workloads: mockWorkloads,
      metrics: mockMetrics,
      alerts: mockAlerts,
    } as PlatformDashboardData,
    message: 'Success', status: 200,
  }),

  scaleWorkload: async (workloadId: string, replicas: number) => ({ data: { success: true }, message: `Scaled to ${replicas} replicas`, status: 200 }),
  restartWorkload: async (workloadId: string) => ({ data: { success: true }, message: 'Rolling restart initiated', status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
