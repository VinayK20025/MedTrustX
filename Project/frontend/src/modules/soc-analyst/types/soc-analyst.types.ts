/**
 * MedTrustX — SOC Analyst Platform Types
 * SIEM Monitoring, Incident Investigation, Threat Detection.
 */

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'New' | 'Investigating' | 'Contained' | 'Resolved';
export type PlaybookStatus = 'Available' | 'Executing' | 'Executed' | 'Failed';

export interface SiemAlert {
  id: string;
  ruleName: string; // e.g., Suspicious Login
  source: string; // IP or System
  severity: AlertSeverity;
  timestamp: string;
  status: 'Unassigned' | 'Investigating' | 'Closed';
  description: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: AlertSeverity;
  assignedTo: string;
  createdTime: string;
  lastUpdated: string;
  relatedAlerts: string[];
}

export interface CorrelatedLog {
  id: string;
  incidentId: string;
  logSource: 'EHR' | 'Firewall' | 'IAM' | 'Endpoint';
  eventAction: string;
  rawLog: string;
  timestamp: string;
}

export interface ThreatIndicator {
  id: string;
  indicatorValue: string; // e.g., 192.168.1.100 or hash
  type: 'IP Address' | 'File Hash' | 'Domain' | 'User Account';
  riskScore: number; // 0-100
  lastSeen: string;
  threatIntelSource: string;
}

export interface ResponsePlaybook {
  id: string;
  incidentId: string;
  actionName: string; // e.g., Block IP on Firewall
  status: PlaybookStatus;
  executedBy?: string;
  timestamp?: string;
}

export interface SocMetrics {
  alertsPerHour: number;
  activeIncidents: number;
  mttdMinutes: number; // Mean Time to Detect
  mttrMinutes: number; // Mean Time to Respond
  threatIntelHits: number;
}

export interface SocData {
  metrics: SocMetrics;
  alerts: SiemAlert[];
  incidents: SecurityIncident[];
  logs: CorrelatedLog[];
  threats: ThreatIndicator[];
  playbooks: ResponsePlaybook[];
}
