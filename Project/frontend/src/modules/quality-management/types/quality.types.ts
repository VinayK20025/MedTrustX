/**
 * MedTrustX — Quality Management Service Types
 */

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved' | 'Closed';
export type ProjectStatus = 'Planning' | 'In Progress' | 'Evaluating' | 'Completed';

export interface QualityIncident {
  id: string;
  type: string; // e.g., 'Medication Error', 'Patient Fall'
  severity: IncidentSeverity;
  status: IncidentStatus;
  reporter: string;
  department: string;
  dateReported: string;
  description: string;
}

export interface QualityIndicator {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'Critical' | 'Warning' | 'On Track';
}

export interface QualityProject {
  id: string;
  title: string;
  leads: string[];
  status: ProjectStatus;
  startDate: string;
  targetCompletion: string;
  progressPercent: number;
}

export interface QualityAudit {
  id: string;
  title: string;
  auditor: string;
  date: string;
  complianceScore: number;
  findingsCount: number;
}

export interface QualityMetrics {
  incidentResolutionRate: number;
  activeQiProjects: number;
  overallComplianceScore: number;
  mortalityRatePercent: number;
  readmissionRatePercent: number;
}

export interface QualityDashboardData {
  metrics: QualityMetrics;
  incidents: QualityIncident[];
  indicators: QualityIndicator[];
  projects: QualityProject[];
}
