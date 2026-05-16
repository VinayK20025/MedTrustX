/**
 * MedTrustX — Nursing Superintendent Types
 * Workforce scheduling, coverage mapping, and operational management models
 */

export interface NursingKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface NursingStaff {
  id: string;
  name: string;
  role: 'ICU Nurse' | 'Ward Nurse' | 'ER Nurse' | 'Ward In-Charge';
  shift: 'Morning' | 'Evening' | 'Night' | 'Off';
  status: 'active' | 'break' | 'absent';
  currentWard?: string;
}

export interface WardCoverage {
  id: string;
  wardName: string;
  nursesRequired: number;
  nursesAssigned: number;
  status: 'optimal' | 'shortage' | 'critical_shortage';
  patientLoad: number;
}

export interface ShiftSchedule {
  id: string;
  nurseId: string;
  nurseName: string;
  date: string;
  shiftType: 'Morning' | 'Evening' | 'Night';
  wardId: string;
  status: 'scheduled' | 'completed' | 'missed';
}

export interface NursingAlert {
  id: string;
  type: 'staff_shortage' | 'incident' | 'task_delay';
  message: string;
  location: string;
  severity: 'critical' | 'warning';
  timestamp: string;
}

export interface NursingSuperintendentData {
  kpis: NursingKPI[];
  staff: NursingStaff[];
  coverage: WardCoverage[];
  schedules: ShiftSchedule[];
  alerts: NursingAlert[];
}
