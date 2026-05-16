/**
 * MedTrustX — CTO Module Types
 * Platform Engineering & Innovation domain models
 */

export interface CtoKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical' | 'neutral';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface MicroserviceNode {
  id: string;
  name: string;
  version: string;
  status: 'healthy' | 'degraded' | 'down';
  language: string;
  latencyP99: number;
  errorRate: number;
  replicas: number;
  dependencies: string[];
  lastDeployed: string;
}

export interface PipelineRun {
  id: string;
  repo: string;
  branch: string;
  status: 'success' | 'failed' | 'running' | 'queued';
  triggeredBy: string;
  duration?: number;
  startedAt: string;
  commit: string;
  stage: string;
}

export interface PerformanceMetric {
  service: string;
  latencyP50: number;
  latencyP99: number;
  throughput: number;
  errorRate: number;
  saturation: number;
}

export interface TechDebtItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'code_quality' | 'dependency' | 'architecture' | 'testing' | 'documentation';
  repo: string;
  effort: string;
  assignedTo?: string;
  status: 'backlog' | 'planned' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface CtoAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  service?: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface CtoDashboardData {
  kpis: CtoKPI[];
  services: MicroserviceNode[];
  pipelines: PipelineRun[];
  performance: PerformanceMetric[];
  techDebt: TechDebtItem[];
  alerts: CtoAlert[];
}
