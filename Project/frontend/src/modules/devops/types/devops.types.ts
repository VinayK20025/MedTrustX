/**
 * MedTrustX — DevOps Engineer (Role 151) Types
 * CI/CD pipeline management, infrastructure automation, monitoring & reliability.
 */

export type Environment = 'Development' | 'Staging' | 'Production';
export type PipelineStatus = 'Running' | 'Success' | 'Failed' | 'Queued' | 'Cancelled';
export type DeploymentStatus = 'Deploying' | 'Success' | 'Failed' | 'Rolled Back';
export type InfraStatus = 'Running' | 'Degraded' | 'Down' | 'Provisioning';

export interface PipelineStage {
  name: 'Build' | 'Test' | 'Security Scan' | 'Deploy';
  status: 'Pending' | 'Running' | 'Success' | 'Failed' | 'Skipped';
  durationSeconds: number;
}

export interface CicdPipeline {
  id: string;
  name: string;
  application: string;
  branch: string;
  triggeredBy: string;
  status: PipelineStatus;
  stages: PipelineStage[];
  durationSeconds: number;
  startedAt: string;
  commitSha: string;
}

export interface Deployment {
  id: string;
  application: string;
  version: string;
  environment: Environment;
  status: DeploymentStatus;
  deployedBy: string;
  deployedAt: string;
  rollbackAvailable: boolean;
  previousVersion?: string;
  healthCheckUrl: string;
}

export interface InfraEnvironment {
  id: string;
  name: Environment;
  provider: string;
  region: string;
  status: InfraStatus;
  cpuUsage: number;       // percentage
  memoryUsage: number;    // percentage
  diskUsage: number;      // percentage
  services: number;
  servicesHealthy: number;
}

export interface DevOpsAlert {
  id: string;
  title: string;
  severity: 'Info' | 'Warning' | 'Critical';
  environment: Environment;
  service: string;
  status: 'Firing' | 'Resolved' | 'Acknowledged';
  firedAt: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
}

export interface DevOpsMetrics {
  deploymentsToday: number;
  successRate: number;    // percentage
  systemUptime: number;   // percentage
  mttrMinutes: number;
  activePipelines: number;
  firingAlerts: number;
}

export interface DevOpsData {
  metrics: DevOpsMetrics;
  pipelines: CicdPipeline[];
  deployments: Deployment[];
  environments: InfraEnvironment[];
  alerts: DevOpsAlert[];
  logs: LogEntry[];
}
