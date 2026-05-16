/**
 * MedTrustX — Patient Relationship Manager (PRM) Types
 */

export interface PrmKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PatientFeedback {
  id: string;
  patientName: string;
  department: string;
  rating: number; // 1-5
  comment: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  dateReceived: string;
}

export interface PatientComplaint {
  id: string;
  patientName: string;
  category: 'Billing' | 'Staff Behavior' | 'Wait Time' | 'Facility' | 'Clinical';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'New' | 'Investigating' | 'Resolved';
  assignedToDepartment: string;
  dateFiled: string;
}

export interface ServiceQualityMetric {
  department: string;
  avgRating: number;
  npsScore: number;
  complaintVolume: number;
  trend: 'Improving' | 'Stable' | 'Declining';
}

export interface PrmDashboardData {
  kpis: PrmKPI[];
  recentFeedback: PatientFeedback[];
  activeComplaints: PatientComplaint[];
  qualityMetrics: ServiceQualityMetric[];
}
