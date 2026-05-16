/**
 * MedTrustX — Accreditation Service Types
 */

export type StandardStatus = 'Compliant' | 'Partial' | 'Non-Compliant' | 'Not Applicable';
export type EvidenceStatus = 'Uploaded' | 'Pending Review' | 'Rejected' | 'Verified';

export interface AccreditationStandard {
  id: string;
  chapter: string;
  code: string;
  statement: string;
  status: StandardStatus;
  lastAssessmentDate: string;
  assessor: string;
  evidenceCount: number;
}

export interface AccreditationEvidence {
  id: string;
  standardId: string;
  title: string;
  fileType: string;
  uploadDate: string;
  status: EvidenceStatus;
  comments?: string;
}

export interface AccreditationSurvey {
  id: string;
  title: string;
  body: string; // e.g., 'JCI', 'NABH'
  startDate: string;
  endDate: string;
  type: 'Mock' | 'Official';
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface AccreditationMetrics {
  overallCompliancePercent: number;
  standardsVerified: number;
  totalStandards: number;
  pendingEvidence: number;
  daysToNextSurvey: number;
}

export interface AccreditationDashboardData {
  metrics: AccreditationMetrics;
  chapters: { name: string; compliance: number; standardsCount: number }[];
  recentStandards: AccreditationStandard[];
  upcomingSurveys: AccreditationSurvey[];
}
