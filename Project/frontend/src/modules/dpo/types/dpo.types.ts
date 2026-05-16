/**
 * MedTrustX — Data Protection Officer (Role 149) Types
 * GDPR compliance, data privacy governance, consent management & breach handling.
 */

export interface DataProcessingActivity {
  id: string;
  system: string;
  purpose: string;
  dataType: 'PHI' | 'PII' | 'Financial' | 'Operational';
  legalBasis: 'Consent' | 'Vital Interest' | 'Legal Obligation' | 'Legitimate Interest';
  dataSubjects: string;
  retentionPeriod: string;
  transfers: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface ConsentRecord {
  id: string;
  patientName: string;
  mrn: string;
  subjectType: 'Patient' | 'Employee' | 'Vendor';
  category: string;
  purpose: string;
  scope: string;
  status: 'Active' | 'Withdrawn' | 'Expired' | 'Pending';
  version: string;
  consentDate: string;
  expiryDate?: string;
}

export interface DataSubjectRequest {
  id: string;
  type: 'Access' | 'Correction' | 'Deletion' | 'Restriction' | 'Portability';
  subjectName: string;
  submittedDate: string;
  dueDate: string; // GDPR: 30-day deadline
  status: 'Pending' | 'Under Review' | 'Completed' | 'Rejected';
  assignedTo: string;
  notes?: string;
}

export interface BreachIncident {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Detected' | 'Investigating' | 'Contained' | 'Reported' | 'Closed';
  dateDetected: string;
  reportedToAuthority: boolean;
  affectedRecords: number;
  affectedSystems: string[];
  description: string;
}

export interface DpiaAssessment {
  id: string;
  projectName: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected';
  startDate: string;
  dpoReviewer: string;
}

export interface DpoMetrics {
  activeRequests: number;
  openBreaches: number;
  complianceScore: number;
  avgResponseTimeDays: number;
  pendingDpias: number;
}

export interface DpoData {
  metrics: DpoMetrics;
  processingActivities: DataProcessingActivity[];
  consentRecords: ConsentRecord[];
  requests: DataSubjectRequest[];
  breaches: BreachIncident[];
  dpias: DpiaAssessment[];
}
