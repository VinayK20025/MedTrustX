/**
 * MedTrustX — IT Administrator (Role 94) Types
 */

export interface ItKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type SystemStatus = 'Operational' | 'Degraded' | 'Down' | 'Maintenance';

export interface SystemHealth {
  id: string;
  name: string; // EMR, LIS, RIS, Billing
  type: string;
  status: SystemStatus;
  uptimePercent: number;
  activeUsers: number;
  lastPing: string;
}

export interface ServerInfra {
  id: string;
  hostname: string;
  role: 'Database' | 'Application' | 'Load Balancer' | 'Storage';
  status: 'OK' | 'Warning' | 'Critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ItIncident {
  id: string;
  title: string;
  description: string;
  systemAffected: string;
  severity: IncidentSeverity;
  status: 'Open' | 'Investigating' | 'Resolved';
  reportedAt: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  isThreat: boolean;
}

export interface ItDashboardData {
  kpis: ItKPI[];
  systems: SystemHealth[];
  infrastructure: ServerInfra[];
  incidents: ItIncident[];
  securityLogs: SecurityLog[];
}
