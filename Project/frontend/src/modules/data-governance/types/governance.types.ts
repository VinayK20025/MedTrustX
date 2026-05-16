/**
 * MedTrustX — Data Governance Service Types
 */

export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted (PHI)';
export type GovernanceStatus = 'Draft' | 'Active' | 'Under Review' | 'Retired';

export interface DataPolicy {
  id: string;
  title: string;
  category: 'Retention' | 'Access' | 'Privacy' | 'Sharing';
  classification: DataClassification;
  status: GovernanceStatus;
  owner: string;
  lastReviewed: string;
  nextReview: string;
}

export interface DataAsset {
  id: string;
  name: string;
  type: 'Table' | 'API' | 'File' | 'Model';
  system: string;
  classification: DataClassification;
  owner: string;
  qualityScore: number;
}

export interface PrivacyRequest {
  id: string;
  patientId: string;
  type: 'Data Access' | 'Right to be Forgotten' | 'Consent Revocation';
  requestDate: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  dueDate: string;
}

export interface GovernanceMetrics {
  totalDataAssets: number;
  phiComplianceScore: number;
  privacyRequestsPending: number;
  dataQualityAverage: number;
  unclassifiedAssetsCount: number;
}

export interface GovernanceDashboardData {
  metrics: GovernanceMetrics;
  topPolicies: DataPolicy[];
  recentPrivacyRequests: PrivacyRequest[];
  dataQualityTrends: { date: string; score: number }[];
}
