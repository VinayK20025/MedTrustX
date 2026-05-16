/**
 * MedTrustX — Resident Doctor Module Types
 * Task-oriented guided execution models
 */

export interface ResidentKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface ResidentPatient {
  id: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnosis: string;
  ward: string;
  bed: string;
  status: 'critical' | 'stable' | 'discharge_ready';
  lastVitals: string;
}

export interface ResidentTask {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  dueTime: string;
  type: 'vitals' | 'meds' | 'notes' | 'labs' | 'procedure';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
}

export interface ResidentAlert {
  id: string;
  patientId: string;
  patientName: string;
  message: string;
  severity: 'critical' | 'warning';
  timestamp: string;
}

export interface ResidentDashboardData {
  kpis: ResidentKPI[];
  patients: ResidentPatient[];
  tasks: ResidentTask[];
  alerts: ResidentAlert[];
}
