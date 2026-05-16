/**
 * MedTrustX — Clinical Research Service Types
 */

export type TrialStatus = 'Recruiting' | 'Active' | 'Completed' | 'Suspended' | 'Terminated' | 'Planning';
export type TrialPhase = 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Observational';
export type PatientEnrollmentStatus = 'Screening' | 'Enrolled' | 'Active' | 'Completed' | 'Withdrawn' | 'Screen Failed';

export interface ClinicalTrial {
  id: string;
  protocolId: string;
  title: string;
  principalInvestigator: string;
  department: string;
  phase: TrialPhase;
  status: TrialStatus;
  targetEnrollment: number;
  currentEnrollment: number;
  startDate: string;
  estimatedEndDate: string;
  sponsor: string;
  tags: string[];
}

export interface EnrolledPatient {
  id: string;
  trialId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  enrollmentDate: string;
  status: PatientEnrollmentStatus;
  lastVisitDate: string;
  nextVisitDate: string;
  adverseEvents: number;
  protocolDeviations: number;
}

export interface ResearchDataset {
  id: string;
  name: string;
  description: string;
  trialId?: string;
  patientCount: number;
  variableCount: number;
  sizeMb: number;
  lastUpdated: string;
  accessLevel: 'Public' | 'Internal' | 'Restricted';
  format: 'CSV' | 'Parquet' | 'FHIR JSON';
  status: 'Draft' | 'Published' | 'Archived';
}

export interface IRBProtocol {
  id: string;
  trialId: string;
  irbNumber: string;
  status: 'Approved' | 'Pending Review' | 'Modifications Required' | 'Expired';
  approvalDate?: string;
  expirationDate: string;
  lastReviewDate: string;
  reviewer: string;
}

export interface ResearchMetrics {
  activeTrials: number;
  totalEnrolledPatients: number;
  pendingIRBReviews: number;
  adverseEventsLast30Days: number;
  totalDatasetsPublished: number;
  fundingActiveGrants: number; // in USD
}

export interface ResearchDashboardData {
  metrics: ResearchMetrics;
  trials: ClinicalTrial[];
  patients: EnrolledPatient[];
  datasets: ResearchDataset[];
  protocols: IRBProtocol[];
}
