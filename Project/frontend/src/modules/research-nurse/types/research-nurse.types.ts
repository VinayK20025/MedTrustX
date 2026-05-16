/**
 * MedTrustX — Research Nurse (Role 130) Types
 * Bedside clinical trial execution, protocol-driven care, and sample collection.
 */

export interface ResearchNurseKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface TrialPatient {
  id: string;
  subjectId: string;
  name: string;
  status: 'Active' | 'Screening' | 'Follow-Up' | 'Completed';
  visitToday: boolean;
  nextDrugDue?: string;
  hasAdverseEvent: boolean;
}

export interface CareProtocolStep {
  id: string;
  label: string;
  type: 'Consent' | 'Drug Admin' | 'Vitals' | 'Sample' | 'Observation';
  isCompleted: boolean;
  timeSensitive?: boolean;
  dueAt?: string;
}

export interface AdverseEvent {
  id: string;
  subject: string;
  description: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
  status: 'Reported' | 'Under Review' | 'Resolved';
  reportedAt: string;
}

export interface ResearchNurseData {
  kpis: ResearchNurseKPI[];
  patients: TrialPatient[];
  protocolSteps: CareProtocolStep[];
  adverseEvents: AdverseEvent[];
}
