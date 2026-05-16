/**
 * MedTrustX — Head Nurse / Ward In-Charge Types
 * Ward-level patient care, staff assignment, and task orchestration models
 */

export interface WardKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface WardPatient {
  id: string;
  name: string;
  bed: string;
  diagnosis: string;
  status: 'stable' | 'observation' | 'critical';
  assignedNurse?: string;
  alerts: number;
}

export interface WardStaff {
  id: string;
  name: string;
  role: 'Staff Nurse' | 'Junior Nurse' | 'Trainee';
  status: 'active' | 'break' | 'busy';
  patientLoad: number;
}

export interface WardTask {
  id: string;
  title: string;
  type: 'medication' | 'vitals' | 'procedure' | 'care';
  patientName: string;
  bed: string;
  assignedNurse?: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WardAlert {
  id: string;
  type: 'patient_critical' | 'task_delay' | 'incident';
  message: string;
  patientId?: string;
  severity: 'high' | 'medium';
  timestamp: string;
}

export interface WardDashboardData {
  kpis: WardKPI[];
  patients: WardPatient[];
  staff: WardStaff[];
  tasks: WardTask[];
  alerts: WardAlert[];
}
