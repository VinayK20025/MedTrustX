/**
 * MedTrustX — Quality Manager (Role 105) Types
 * Hospital governance, accreditation compliance, and continuous improvement.
 */

export interface QualityKPI {
  id: string;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'flat';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface DepartmentScorecard {
  id: string;
  department: string;
  score: number; // 0-100
  complianceScore: number;
  incidentCount: number;
  status: 'Pass' | 'Warning' | 'Fail';
}

export interface QualityAudit {
  id: string;
  title: string;
  type: 'Internal' | 'External' | 'NABH' | 'JCI';
  area: string;
  status: 'Scheduled' | 'In Progress' | 'Review' | 'Completed';
  scheduledDate: string;
  auditor: string;
}

export interface SafetyIncident {
  id: string;
  type: 'Medication Error' | 'Fall' | 'Infection' | 'Equipment Failure';
  severity: 'Sentinel' | 'Major' | 'Moderate' | 'Minor';
  department: string;
  status: 'Reported' | 'RCA Required' | 'RCA Ongoing' | 'Closed';
  reportedAt: string;
}

export interface CAPA {
  id: string;
  issue: string;
  action: string;
  department: string;
  status: 'Draft' | 'Implemented' | 'Verifying' | 'Closed';
  dueDate: string;
}

export interface QualityRiskAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  department?: string;
  detectedAt: string;
}

export interface QualityManagerData {
  kpis: QualityKPI[];
  scorecards: DepartmentScorecard[];
  audits: QualityAudit[];
  incidents: SafetyIncident[];
  capas: CAPA[];
  alerts: QualityRiskAlert[];
}
