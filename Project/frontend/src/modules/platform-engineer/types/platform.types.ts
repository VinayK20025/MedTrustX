/**
 * MedTrustX — Platform Engineer (Kubernetes) Types
 */

export interface PlatformKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface K8sCluster {
  id: string;
  name: string;
  environment: 'Production' | 'Staging' | 'Development';
  version: string;
  nodes: {
    total: number;
    ready: number;
  };
  status: 'Healthy' | 'Degraded' | 'Critical';
}

export interface K8sNode {
  id: string;
  clusterId: string;
  name: string;
  role: 'Control Plane' | 'Worker';
  status: 'Ready' | 'NotReady' | 'SchedulingDisabled';
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
}

export interface K8sWorkload {
  id: string;
  namespace: string;
  name: string;
  type: 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'Job';
  pods: {
    desired: number;
    current: number;
    ready: number;
    restarts: number;
  };
  status: 'Running' | 'Scaling' | 'CrashLoopBackOff' | 'Pending';
}

export interface PlatformMetric {
  timestamp: string;
  clusterId: string;
  cpuUtilization: number;
  memoryUtilization: number;
  networkEgress: number; // Mbps
  networkIngress: number; // Mbps
  apiLatency: number; // ms
}

export interface PlatformAlert {
  id: string;
  clusterId: string;
  namespace?: string;
  resource?: string;
  type: 'PodCrashLoop' | 'NodeNotReady' | 'HighCPU' | 'OOMKilled' | 'IngressError';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface PlatformDashboardData {
  kpis: PlatformKPI[];
  clusters: K8sCluster[];
  nodes: K8sNode[];
  workloads: K8sWorkload[];
  metrics: PlatformMetric[];
  alerts: PlatformAlert[];
}
