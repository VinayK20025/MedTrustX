/**
 * MedTrustX — Regulatory Inspector (Role 136) Types
 * Legal enforcement inspections, statutory compliance, violation tracking, and penalty actions.
 */

export interface InspectorKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface Inspection {
  id: string;
  facility: string;
  type: 'Scheduled' | 'Surprise' | 'Follow-Up';
  scope: string;
  status: 'Planned' | 'In Progress' | 'Report Pending' | 'Closed';
  date: string;
  violationsFound: number;
  complianceScore: number;
}

export interface LegalCheckItem {
  id: string;
  law: string;
  section: string;
  criteria: string;
  status: 'Compliant' | 'Violation' | 'Partial' | 'Not Inspected';
  evidenceCaptured: boolean;
}

export interface Violation {
  id: string;
  issue: string;
  law: string;
  severity: 'Critical' | 'Major' | 'Minor';
  department: string;
  status: 'Open' | 'Notice Issued' | 'Penalty Applied' | 'Rectified';
  geoTag?: string;
  evidenceCount: number;
}

export interface EnforcementAction {
  id: string;
  violationId: string;
  type: 'Warning Notice' | 'Show Cause' | 'Fine' | 'Suspension' | 'Closure Order';
  status: 'Draft' | 'Issued' | 'Acknowledged';
  issuedAt?: string;
}

export interface InspectorData {
  kpis: InspectorKPI[];
  inspections: Inspection[];
  checklist: LegalCheckItem[];
  violations: Violation[];
  actions: EnforcementAction[];
}
