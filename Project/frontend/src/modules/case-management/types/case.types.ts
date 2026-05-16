/**
 * MedTrustX — Case Management Service Types
 */

export type DischargeStatus = 'Planning' | 'Pending Approval' | 'Transport Arranged' | 'Completed' | 'Delayed';
export type ReferralType = 'Social Work' | 'Home Health' | 'Rehab' | 'Skilled Nursing' | 'Chaplaincy';

export interface CaseStudy {
  id: string;
  patientId: string;
  patientName: string;
  admissionDate: string;
  estimatedDischargeDate: string;
  status: DischargeStatus;
  barriersToDischarge: string[];
  acuityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface UtilizationReview {
  id: string;
  caseId: string;
  payerName: string;
  status: 'Approved' | 'Denied' | 'Pending Review' | 'Appeal in Progress';
  authorizedDays: number;
  nextReviewDate: string;
}

export interface SocialReferral {
  id: string;
  caseId: string;
  referralType: ReferralType;
  providerName?: string;
  status: 'Initiated' | 'Accepted' | 'Waitlisted' | 'Completed';
  notes: string;
}

export interface CaseMetrics {
  totalActiveCases: number;
  averageLengthOfStayDays: number;
  dischargeReadyCount: number;
  pendingUtilizationReviews: number;
  readmissionRiskHighCount: number;
}

export interface CaseDashboardData {
  metrics: CaseMetrics;
  highAcuityCases: CaseStudy[];
  pendingReviews: UtilizationReview[];
  activeReferrals: SocialReferral[];
}
