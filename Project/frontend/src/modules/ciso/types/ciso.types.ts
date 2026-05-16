/**
 * MedTrustX — CISO Module Types
 * Security Command Center domain models
 */

export interface CisoKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'critical' | 'warning' | 'secure' | 'neutral';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface ThreatEvent {
  id: string;
  type: 'intrusion' | 'brute_force' | 'privilege_escalation' | 'data_exfiltration' | 'anomaly';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  target: string;
  description: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'mitigated' | 'resolved';
  mitreTactic?: string;
}

export interface AccessLogEntry {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: 'login' | 'logout' | 'access' | 'modify' | 'delete' | 'break_glass';
  resource: string;
  outcome: 'success' | 'denied' | 'flagged';
  ipAddress: string;
  timestamp: string;
  riskScore: number;
}

export interface ComplianceMetric {
  id: string;
  framework: string;
  score: number;
  target: number;
  violations: number;
  lastAudit: string;
  status: 'compliant' | 'at_risk' | 'non_compliant';
}

export interface SecurityIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'breach' | 'unauthorized_access' | 'policy_violation' | 'malware' | 'insider_threat';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  assignedTo?: string;
  affectedSystems: string[];
  createdAt: string;
  ttd?: number; // time to detect (minutes)
  ttr?: number; // time to resolve (minutes)
}

export interface CisoAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  source: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface CisoDashboardData {
  kpis: CisoKPI[];
  threats: ThreatEvent[];
  accessLogs: AccessLogEntry[];
  compliance: ComplianceMetric[];
  incidents: SecurityIncident[];
  alerts: CisoAlert[];
}
