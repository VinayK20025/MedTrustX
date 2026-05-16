/**
 * MedTrustX — Trial Coordinator (Role 129) Types
 * Day-to-day clinical trial execution, participant scheduling, CRF management, and compliance.
 */

export interface TrialCoordKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface TrialParticipant {
  id: string;
  subjectId: string;
  name: string;
  status: 'Screening' | 'Active' | 'Completed' | 'Withdrawn';
  nextVisit: string;
  visitNumber: number;
  totalVisits: number;
  hasDeviation: boolean;
}

export interface VisitTask {
  id: string;
  label: string;
  type: 'Lab' | 'Assessment' | 'Document' | 'Consent';
  isCompleted: boolean;
}

export interface ProtocolDeviation {
  id: string;
  subject: string;
  issue: string;
  severity: 'Major' | 'Minor';
  status: 'Open' | 'Resolved';
  reportedAt: string;
}

export interface TrialCoordData {
  kpis: TrialCoordKPI[];
  participants: TrialParticipant[];
  visitTasks: VisitTask[];
  deviations: ProtocolDeviation[];
}
