/**
 * MedTrustX — IT Operations Manager Types
 * System Health, SLA Governance, Incident Oversight
 */

export interface ITOpsKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface ITOpsServiceHealth {
  id: string;
  system: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  lastIncident: string;
}

export interface ITOpsSLA {
  id: string;
  service: string;
  target: string;
  actual: string;
  status: 'compliant' | 'at_risk' | 'breached';
}

export interface ITOpsIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'assigned' | 'mitigated' | 'resolved';
  assignedTeam: string;
  timeOpen: string;
}

export interface ITOpsAlert {
  id: string;
  type: 'sla_breach' | 'system_down' | 'escalation';
  message: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface ITOpsDashboardData {
  kpis: ITOpsKPI[];
  health: ITOpsServiceHealth[];
  slas: ITOpsSLA[];
  incidents: ITOpsIncident[];
  alerts: ITOpsAlert[];
}
