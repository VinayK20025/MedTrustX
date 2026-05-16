/**
 * MedTrustX — Patient Experience Service Types
 */

export type ExperienceMetric = 'HCAHPS' | 'NPS' | 'CSAT';
export type FeedbackStatus = 'Received' | 'Assigned' | 'Investigating' | 'Resolved' | 'Closed';

export interface PatientSurvey {
  id: string;
  patientId: string;
  patientName: string;
  admissionDate: string;
  dischargeDate: string;
  score: number;
  comments?: string;
  tags: string[];
}

export interface Grievance {
  id: string;
  patientId: string;
  patientName: string;
  category: 'Clinical' | 'Billing' | 'Staff Behavior' | 'Facility';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: FeedbackStatus;
  description: string;
  receivedDate: string;
  resolvedDate?: string;
}

export interface PatientRequest {
  id: string;
  patientId: string;
  roomNumber: string;
  requestType: 'Meal' | 'Blanket' | 'Chaplain' | 'Translation' | 'Advocacy';
  status: 'Pending' | 'In Progress' | 'Fulfilled';
  requestTime: string;
}

export interface ExperienceMetrics {
  averageNpsScore: number;
  surveyCompletionRatePercent: number;
  activeGrievancesCount: number;
  averageResolutionTimeHours: number;
  sentimentScorePercent: number;
}

export interface ExperienceDashboardData {
  metrics: ExperienceMetrics;
  recentSurveys: PatientSurvey[];
  activeGrievances: Grievance[];
  pendingRequests: PatientRequest[];
}
