/**
 * MedTrustX — Transplant Coordination Service Types
 */

export type TransplantStatus = 'Waitlisted' | 'Matching' | 'Scheduled' | 'Procurement' | 'Post-Transplant' | 'Completed';
export type OrganType = 'Kidney' | 'Liver' | 'Heart' | 'Lung' | 'Pancreas' | 'Cornea';
export type PriorityLevel = 'Routine' | 'Urgent' | 'Critical' | 'Immediate';

export interface TransplantRecipient {
  id: string;
  patientId: string;
  name: string;
  organNeeded: OrganType;
  bloodType: string;
  hlaTyping: string;
  priority: PriorityLevel;
  waitlistEntryDate: string;
  status: TransplantStatus;
  matchingScore?: number;
}

export interface OrganDonor {
  id: string;
  type: 'Living' | 'Deceased';
  organType: OrganType;
  bloodType: string;
  hlaTyping: string;
  status: 'Available' | 'Reserved' | 'Procured';
  location: string;
}

export interface TransplantMatch {
  id: string;
  recipientId: string;
  donorId: string;
  matchScore: number;
  compatibilityDetails: string;
  status: 'Proposed' | 'Confirmed' | 'Surgery Scheduled';
}

export interface TransplantMetrics {
  totalWaitlisted: number;
  activeMatches: number;
  completedTransplantsYTD: number;
  averageWaitTimeDays: number;
  organSurvivalRatePercent: number;
}

export interface TransplantDashboardData {
  metrics: TransplantMetrics;
  topWaitlist: TransplantRecipient[];
  recentMatches: TransplantMatch[];
  availableOrgans: OrganDonor[];
}
