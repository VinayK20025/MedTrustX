/**
 * MedTrustX — Automation Bots Platform Types
 * CI/CD pipelines, autonomous agents, execution tracking.
 */

export type BotStatus = 'Active' | 'Paused' | 'Error' | 'Deploying';
export type BotType = 'CI/CD Pipeline' | 'Monitoring Agent' | 'Auto-Scaler' | 'Security Scanner';
export type JobStatus = 'Success' | 'Failed' | 'Running' | 'Pending';
export type IncidentSeverity = 'Critical' | 'Warning' | 'Info';

export interface AutomationBot {
  id: string;
  name: string; // e.g., prod-deploy-bot
  type: BotType;
  status: BotStatus;
  lastExecution: string;
  successRate: number;
}

export interface PipelineJob {
  id: string;
  botId: string;
  jobName: string;
  status: JobStatus;
  durationMs: number;
  timestamp: string;
  triggeredBy: string;
}

export interface MonitoringMetric {
  id: string;
  botId: string;
  metricName: string;
  status: 'Normal' | 'Anomaly Detected' | 'Warning';
  currentValue: string;
  timestamp: string;
}

export interface AutonomousAction {
  id: string;
  botId: string;
  actionName: string; // e.g., Rollback Deployment
  reason: string;
  status: 'Done' | 'In Progress' | 'Overridden' | 'Failed';
  timestamp: string;
}

export interface IncidentAlert {
  id: string;
  botId: string;
  issue: string;
  severity: IncidentSeverity;
  timestamp: string;
  resolved: boolean;
  automatedActionTaken?: string;
}

export interface AutomationMetrics {
  activeBots: number;
  totalJobsExecuted: number;
  successRate: number; // percentage
  anomaliesDetected: number;
  humanOverrides: number;
}

export interface AutomationData {
  metrics: AutomationMetrics;
  bots: AutomationBot[];
  jobs: PipelineJob[];
  monitoring: MonitoringMetric[];
  actions: AutonomousAction[];
  incidents: IncidentAlert[];
}
