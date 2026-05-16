/**
 * MedTrustX — CNO Module Types
 */

export interface CnoKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'critical' | 'warning' | 'good' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface NursingTask {
  id: string;
  patientName: string;
  room: string;
  taskType: 'medication' | 'vitals' | 'procedure' | 'monitoring' | 'other';
  description: string;
  dueTime: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  priority: 'high' | 'medium' | 'low';
}

export interface StaffingOverview {
  totalOnShift: number;
  requiredStaff: number;
  ratio: string;
  shortages: { ward: string; required: number; actual: number }[];
}

export interface CareStatus {
  onTime: number;
  delayed: number;
  missed: number;
  criticalPatients: number;
}

export interface ShiftOverview {
  currentShift: string;
  shiftManager: string;
  handoversPending: number;
  incidentsReported: number;
}

export interface CnoAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  ward: string;
  actionRequired: boolean;
}

export interface CnoDashboardData {
  kpis: CnoKPI[];
  tasks: NursingTask[];
  staffing: StaffingOverview;
  careStatus: CareStatus;
  shift: ShiftOverview;
  alerts: CnoAlert[];
}
