/**
 * MedTrustX — Head of Department Module Types
 * Specialty-level Clinical & Operational domain models
 */

export interface HODKpi {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'warning' | 'critical' | 'improving';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface DeptPatient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  ward: string;
  bed: string;
  diagnosis: string;
  admittedAt: string;
  attendingDoctor: string;
  acuity: 'critical' | 'high' | 'moderate' | 'stable';
  los: number; // days
  pendingActions: string[];
}

export interface DeptStaff {
  id: string;
  name: string;
  role: 'consultant' | 'registrar' | 'resident' | 'nurse';
  status: 'on_duty' | 'on_call' | 'off_duty' | 'leave';
  activeCases: number;
  maxCases: number;
  shift: string;
}

export interface DeptOutcome {
  metric: string;
  current: number;
  previous: number;
  benchmark: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface DeptCase {
  id: string;
  patientName: string;
  type: 'elective' | 'emergency' | 'follow_up';
  procedure?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'pending_review';
  scheduledAt: string;
  surgeon?: string;
}

export interface DeptAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  patientName?: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface HODDashboardData {
  department: string;
  kpis: HODKpi[];
  patients: DeptPatient[];
  staff: DeptStaff[];
  outcomes: DeptOutcome[];
  cases: DeptCase[];
  alerts: DeptAlert[];
}
