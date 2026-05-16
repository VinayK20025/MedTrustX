/**
 * MedTrustX — Incident Management Service Types
 */

export type IncidentCategory = 'Patient Safety' | 'Occupational Health' | 'Security' | 'Information Security' | 'Facility' | 'Environmental';
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Extreme' | 'Sentinel';
export type IncidentStatus = 'Reported' | 'Under Investigation' | 'RCA in Progress' | 'Corrective Action' | 'Closed';

export interface IncidentReport {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  location: string;
  reportedAt: string;
  reportedBy: string;
  description: string;
}

export interface RootCauseAnalysis {
  id: string;
  incidentId: string;
  methodology: '5 Whys' | 'Fishbone' | 'TapRooT';
  findings: string[];
  recommendations: string[];
  assignedTo: string;
  targetCompletionDate: string;
}

export interface IncidentMetrics {
  totalIncidentsCount: number;
  openInvestigationsCount: number;
  averageTimeToClosureDays: number;
  highSeverityAlertsCount: number;
  rcaCompletionRatePercent: number;
}

export interface IncidentDashboardData {
  metrics: IncidentMetrics;
  recentIncidents: IncidentReport[];
  criticalInvestigations: IncidentReport[];
  pendingRCAs: RootCauseAnalysis[];
}
