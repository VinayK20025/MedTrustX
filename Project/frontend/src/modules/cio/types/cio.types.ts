/**
 * MedTrustX — CIO Module Types
 */

export interface CioKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  trend?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
  latency: number;
  errorRate: number;
}

export interface InfraNode {
  id: string;
  name: string;
  type: 'compute' | 'database' | 'cache' | 'storage';
  cpuUsage: number;
  memUsage: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface DataPipeline {
  id: string;
  name: string;
  lastRun: string;
  status: 'success' | 'running' | 'failed';
  recordsProcessed: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'p1' | 'p2' | 'p3' | 'p4';
  status: 'open' | 'investigating' | 'resolved';
  system: string;
  assignedTo?: string;
  createdAt: string;
}

export interface CioAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  system: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface CioDashboardData {
  kpis: CioKPI[];
  services: ServiceHealth[];
  infrastructure: InfraNode[];
  pipelines: DataPipeline[];
  incidents: Incident[];
  alerts: CioAlert[];
}
