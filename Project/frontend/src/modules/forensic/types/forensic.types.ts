/**
 * MedTrustX — Forensic Service Types
 */

export type CaseStatus = 'Open' | 'Under Investigation' | 'Closed' | 'Archived' | 'Evidence Pending';
export type CasePriority = 'Routine' | 'Urgent' | 'Immediate' | 'Statutory';

export interface ForensicCase {
  id: string;
  policeCaseId: string;
  subjectName: string;
  subjectAge?: number;
  subjectGender: 'Male' | 'Female' | 'Other';
  caseType: 'Physical Assault' | 'Sexual Assault' | 'Suspicious Death' | 'Toxicology' | 'DNA Analysis';
  priority: CasePriority;
  status: CaseStatus;
  incidentDate: string;
  examiningOfficer: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  type: string;
  description: string;
  collectedAt: string;
  collectedBy: string;
  chainOfCustody: {
    from: string;
    to: string;
    timestamp: string;
    reason: string;
  }[];
  secureStorageLocation: string;
}

export interface MedicoLegalReport {
  id: string;
  caseId: string;
  title: string;
  findingsSummary: string;
  finalOpinion: string;
  author: string;
  signedAt: string;
  status: 'Draft' | 'Finalized' | 'Released to Authorities';
}

export interface CourtSummon {
  id: string;
  caseId: string;
  courtName: string;
  appearanceDate: string;
  witnessRole: 'Expert Witness' | 'Fact Witness';
  status: 'Scheduled' | 'Attended' | 'Rescheduled';
}

export interface ForensicMetrics {
  totalActiveCases: number;
  pendingExamsCount: number;
  evidenceItemsInCustody: number;
  reportsFinalizedThisMonth: number;
  averageTurnaroundDays: number;
}

export interface ForensicDashboardData {
  metrics: ForensicMetrics;
  recentCases: ForensicCase[];
  evidenceAlerts: EvidenceItem[];
  upcomingCourtDates: CourtSummon[];
}
