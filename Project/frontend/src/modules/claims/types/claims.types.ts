/**
 * MedTrustX — Claims Coordinator (Role 83) Types
 */

export interface ClaimsKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'currency';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type ClaimPipelineStage = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';

export interface ClaimDetails {
  id: string;
  patientName: string;
  mrn: string;
  insurer: string;
  policyNumber: string;
  claimAmount: number;
  expectedAmount: number;
  receivedAmount?: number;
  stage: ClaimPipelineStage;
  submittedAt?: string;
  agingDays: number;
  agingBucket: '0-7' | '8-30' | '30+';
  rejectionReason?: string;
  missingDocuments: string[];
}

export interface ClaimFollowUp {
  id: string;
  claimId: string;
  patientName: string;
  insurer: string;
  lastContact: string;
  nextAction: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

export interface ClaimsDashboardData {
  kpis: ClaimsKPI[];
  claims: ClaimDetails[];
  followUps: ClaimFollowUp[];
}
