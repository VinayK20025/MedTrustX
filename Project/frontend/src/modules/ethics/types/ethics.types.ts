/**
 * MedTrustX — Ethics Service Types
 */

export type EthicsRequestStatus = 'New' | 'Active' | 'Deliberating' | 'Resolved';
export type EthicsPolicyType = 'Clinical' | 'Research' | 'Administrative' | 'AI';

export interface EthicsConsultation {
  id: string;
  patientId: string;
  patientName: string;
  department: string;
  requestor: string;
  reason: string;
  status: EthicsRequestStatus;
  dateRequested: string;
  priority: 'Routine' | 'Urgent';
}

export interface EthicsCommitteeMember {
  id: string;
  name: string;
  role: string;
  department: string;
  termExpiry: string;
}

export interface EthicsPolicy {
  id: string;
  title: string;
  type: EthicsPolicyType;
  lastReviewDate: string;
  nextReviewDate: string;
  status: 'Current' | 'Under Revision' | 'Draft';
}

export interface EthicsCoiDeclaration {
  id: string;
  staffName: string;
  department: string;
  type: 'Financial' | 'Professional' | 'Research';
  disclosureDate: string;
  status: 'Clear' | 'Requires Management Plan';
}

export interface EthicsMetrics {
  activeConsultations: number;
  averageResponseTimeHours: number;
  committeeMeetingAttendancePercent: number;
  coiComplianceRatePercent: number;
}

export interface EthicsDashboardData {
  metrics: EthicsMetrics;
  consultations: EthicsConsultation[];
  upcomingMeetings: { date: string; agenda: string; location: string }[];
  coiAlerts: { staffName: string; issue: string; date: string }[];
}
