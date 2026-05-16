/**
 * MedTrustX — Insurance Representative (Role 137) Types
 * Policy verification, pre-authorization, claims processing, and financial clearance.
 */

export interface InsuranceKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface InsuranceCase {
  id: string;
  patientName: string;
  policyNumber: string;
  insurer: string;
  treatment: string;
  estimatedCost: number;
  coverageLimit: number;
  status: 'Eligibility Check' | 'Pre-Auth Pending' | 'Approved' | 'Rejected' | 'Claim Submitted' | 'Settled';
  admissionDate: string;
  missingDocs: string[];
}

export interface PreAuthRequest {
  id: string;
  caseId: string;
  treatment: string;
  estimatedAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Query Raised';
  requestedAt: string;
  turnaroundHrs?: number;
}

export interface InsuranceClaim {
  id: string;
  caseId: string;
  claimAmount: number;
  approvedAmount?: number;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Settled';
  submittedAt: string;
  docsComplete: boolean;
}

export interface InsuranceRepData {
  kpis: InsuranceKPI[];
  cases: InsuranceCase[];
  preAuths: PreAuthRequest[];
  claims: InsuranceClaim[];
}
