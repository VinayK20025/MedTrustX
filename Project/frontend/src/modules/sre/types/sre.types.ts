/**
 * MedTrustX — Site Reliability Engineer (SRE) Types
 * Uptime, Incident Management, Observability
 */

export interface SREKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface SREService {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  latency: string;
  errorRate: string;
}

export interface SREMetric {
  id: string;
  serviceId: string;
  cpu: number;
  memory: number;
  activeConnections: number;
}

export interface SREIncident {
  id: string;
  title: string;
  serviceId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  createdAt: string;
}

export interface SREAlert {
  id: string;
  type: 'latency' | 'error_spike' | 'node_down' | 'db_connection';
  message: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface SREDashboardData {
  kpis: SREKPI[];
  services: SREService[];
  metrics: SREMetric[];
  incidents: SREIncident[];
  alerts: SREAlert[];
}
