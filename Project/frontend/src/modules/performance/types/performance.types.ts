/**
 * MedTrustX — Performance Service Types
 */

export type AppraisalStatus = 'Draft' | 'Self-Assessment' | 'Peer-Review' | 'Manager-Review' | 'Completed';
export type PerformanceRating = 1 | 2 | 3 | 4 | 5;

export interface Appraisal {
  id: string;
  staffId: string;
  staffName: string;
  period: string;
  status: AppraisalStatus;
  overallRating?: PerformanceRating;
  nextReviewDate: string;
}

export interface ClinicalKPI {
  id: string;
  staffId: string;
  metricName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  trend: 'Up' | 'Down' | 'Stable';
}

export interface FeedbackEntry {
  id: string;
  staffId: string;
  source: 'Patient' | 'Peer' | 'Supervisor';
  rating: PerformanceRating;
  comment: string;
  date: string;
}

export interface DevelopmentGoal {
  id: string;
  staffId: string;
  goal: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Achieved' | 'Deferred';
}

export interface PerformanceMetrics {
  averageStaffRating: number;
  appraisalCompletionRatePercent: number;
  kpiTargetAchievementPercent: number;
  patientSatisfactionScore: number;
  trainingCompliancePercent: number;
}

export interface PerformanceDashboardData {
  metrics: PerformanceMetrics;
  activeAppraisals: Appraisal[];
  topClinicalKpis: ClinicalKPI[];
  recentFeedback: FeedbackEntry[];
}
