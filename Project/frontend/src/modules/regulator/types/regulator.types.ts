/**
 * MedTrustX — Regulator Integration Service Types
 */

export type SubmissionStatus = 'Draft' | 'Sent' | 'Received' | 'Approved' | 'Rejected' | 'Query Raised';
export type RegulatoryBody = 'Ministry of Health' | 'Drug Control Authority' | 'Radiation Safety Board' | 'Environmental Protection' | 'Medical Council';

export interface RegulatorySubmission {
  id: string;
  title: string;
  body: RegulatoryBody;
  submittedAt: string;
  status: SubmissionStatus;
  category: 'Annual Report' | 'Adverse Event' | 'Public Health Data' | 'Licensing Renewal';
  fileUrl?: string;
}

export interface InstitutionalLicense {
  id: string;
  type: string;
  issuedBy: RegulatoryBody;
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export interface RegulatoryDirective {
  id: string;
  body: RegulatoryBody;
  priority: 'Low' | 'Medium' | 'High' | 'Immediate Action';
  title: string;
  receivedAt: string;
  deadline?: string;
  acknowledged: boolean;
}

export interface RegulatorMetrics {
  totalSubmissionsYTD: number;
  pendingRegulatoryQueries: number;
  activeLicensesCount: number;
  unacknowledgedDirectives: number;
  complianceScorePercent: number;
}

export interface RegulatorDashboardData {
  metrics: RegulatorMetrics;
  recentSubmissions: RegulatorySubmission[];
  expiringLicenses: InstitutionalLicense[];
  activeDirectives: RegulatoryDirective[];
}
