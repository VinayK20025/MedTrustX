/**
 * MedTrustX — Credentialing Service Types
 */

export type CredentialStatus = 'Active' | 'Pending' | 'Expired' | 'Suspended' | 'In Review';
export type VerificationMethod = 'Primary Source' | 'NPDB' | 'State Board' | 'DEA';

export interface CredentialItem {
  id: string;
  type: string; // e.g., 'State License', 'Board Cert', 'DEA'
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: CredentialStatus;
  lastVerified: string;
  verificationMethod: VerificationMethod;
}

export interface MedicalStaffMember {
  id: string;
  name: string;
  specialty: string;
  npi: string;
  status: 'Credentialed' | 'Provisional' | 'Lapsed';
  credentials: CredentialItem[];
  privileges: string[];
  recredentialingDate: string;
}

export interface CredentialingMetrics {
  totalCredentialedStaff: number;
  pendingApplications: number;
  expiringWithin30Days: number;
  verificationSuccessRate: number;
  averageProcessingDays: number;
}

export interface CredentialingDashboardData {
  metrics: CredentialingMetrics;
  recentStaff: MedicalStaffMember[];
  expiringCredentials: { staffName: string; type: string; expiryDate: string }[];
}
