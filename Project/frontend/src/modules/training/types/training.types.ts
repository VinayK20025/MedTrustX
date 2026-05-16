/**
 * MedTrustX — Training Coordinator (Role 78) Types
 */

export interface TrainingKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface TrainingProgram {
  id: string;
  name: string;
  type: 'Mandatory' | 'Elective' | 'Onboarding';
  category: 'Clinical' | 'Safety' | 'Compliance' | 'Soft Skills';
  durationHours: number;
  enrolledCount: number;
  completedCount: number;
  status: 'Active' | 'Scheduled' | 'Archived';
}

export interface TrainingSession {
  id: string;
  programName: string;
  date: string;
  time: string;
  trainer: string;
  location: string;
  capacity: number;
  enrolled: number;
  status: 'Upcoming' | 'In Progress' | 'Completed';
}

export interface StaffTrainingRecord {
  id: string;
  staffName: string;
  role: string;
  department: string;
  courseName: string;
  status: 'Completed' | 'In Progress' | 'Not Started' | 'Overdue';
  completedAt?: string;
  certExpiry?: string;
  certDaysRemaining?: number;
}

export interface CertificationAlert {
  id: string;
  staffName: string;
  role: string;
  certification: string;
  expiryDate: string;
  daysRemaining: number;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface TrainingDashboardData {
  kpis: TrainingKPI[];
  programs: TrainingProgram[];
  upcomingSessions: TrainingSession[];
  staffRecords: StaffTrainingRecord[];
  certAlerts: CertificationAlert[];
}
