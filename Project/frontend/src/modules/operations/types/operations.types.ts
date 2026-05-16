/**
 * MedTrustX — Operations Manager (Role 85) Types
 */

export interface OpsKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: 'up' | 'down' | 'flat';
}

export interface PatientFlowMetrics {
  stage: 'Admissions' | 'ER / Triage' | 'OPD Consults' | 'Discharges';
  currentVolume: number;
  avgWaitTimeMins: number;
  bottleneck: boolean;
  trend: 'up' | 'down' | 'flat';
}

export interface BedStatus {
  department: string;
  total: number;
  occupied: number;
  cleaning: number;
  available: number;
  occupancyRate: number;
}

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Active' | 'Assigned' | 'Resolved';

export interface OpsIncident {
  id: string;
  type: 'Patient Delay' | 'Equipment Failure' | 'Staff Shortage' | 'Facility Issue';
  location: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string;
  assignedTo?: string;
}

export interface OperationsDashboardData {
  kpis: OpsKPI[];
  flow: PatientFlowMetrics[];
  beds: BedStatus[];
  incidents: OpsIncident[];
}
