/**
 * MedTrustX — Application Support Engineer (Role 97) Types
 */

export interface AppSupportKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'text' | 'percentage' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type IncidentSeverity = 'Sev 1' | 'Sev 2' | 'Sev 3' | 'Sev 4';
export type IncidentStatus = 'New' | 'Investigating' | 'Mitigated' | 'Resolved';

export interface AppHealth {
  appId: string;
  name: string; // EMR, LIS, RIS
  status: 'Healthy' | 'Warning' | 'Critical';
  responseTimeMs: number;
  errorRatePercent: number;
  throughput: number;
}

export interface ReleaseCorrelation {
  version: string;
  deployedAt: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface LogTrace {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  service: string;
}

export interface AppIncident {
  id: string;
  title: string;
  appAffected: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  firstSeenAt: string;
  description: string;
  affectedUsersCount: number;
  affectedDepartments: string[];
  failedTransactionsCount?: number;
  recentRelease?: ReleaseCorrelation;
  traces: LogTrace[];
}

export interface AppSupportDashboardData {
  kpis: AppSupportKPI[];
  healthGrid: AppHealth[];
  incidents: AppIncident[];
}
