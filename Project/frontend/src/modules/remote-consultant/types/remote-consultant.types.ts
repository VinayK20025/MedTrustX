/**
 * MedTrustX — Remote Consultant (Role 133) Types
 * Specialist second-opinion, case review, imaging annotation, and expert advisory.
 */

export interface ConsultantKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface ConsultCase {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  referredBy: string;
  specialty: string;
  priority: 'Urgent' | 'High' | 'Routine';
  status: 'Pending' | 'In Review' | 'Opinion Sent' | 'Closed';
  summary: string;
  receivedAt: string;
  reports: CaseReport[];
}

export interface CaseReport {
  id: string;
  type: 'Lab' | 'Radiology' | 'Pathology' | 'Clinical Notes';
  title: string;
  date: string;
  highlight?: string;
}

export interface ConsultantData {
  kpis: ConsultantKPI[];
  cases: ConsultCase[];
}
