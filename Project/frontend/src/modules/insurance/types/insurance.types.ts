/**
 * MedTrustX — Insurance & TPA Integration Service Types
 */

export type ClaimStatus = 'Pending' | 'Submitted' | 'Processing' | 'Paid' | 'Denied' | 'Appealed' | 'Reconciled';
export type PayerType = 'Public' | 'Private' | 'International' | 'Self-Pay' | 'Government Scheme';
export type DenialCategory = 'Eligibility' | 'Documentation' | 'Coding' | 'Prior Auth' | 'Duplicate' | 'Non-Covered';

export interface InsurancePayer {
  id: string;
  name: string;
  type: PayerType;
  claimSuccessRatePercent: number;
  averageReimbursementDays: number;
  activeContractId: string;
  tpaAssociated?: string; // Third Party Administrator name if any
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  payerId: string;
  payerName: string;
  serviceDate: string;
  amount: number;
  status: ClaimStatus;
  denialReason?: string;
  denialCategory?: DenialCategory;
  reimbursementAmount?: number;
  remittanceRef?: string;
}

export interface PriorAuthorization {
  id: string;
  patientId: string;
  procedureCode: string;
  payerId: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  requestedAt: string;
  expiresAt: string;
  approvalCode?: string;
}

export interface DenialAnalytic {
  category: DenialCategory;
  count: number;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export interface InsuranceMetrics {
  totalClaimsValue: number;
  cleanClaimRatePercent: number;
  denialRatePercent: number;
  averageDaysInAR: number;
  eligibilityCheckVolume: number;
  totalReimbursedValue: number;
  pendingAppealsCount: number;
}

export interface InsuranceDashboardData {
  metrics: InsuranceMetrics;
  recentClaims: InsuranceClaim[];
  pendingAuthorizations: PriorAuthorization[];
  topPayers: InsurancePayer[];
  denialAnalytics: DenialAnalytic[];
}
