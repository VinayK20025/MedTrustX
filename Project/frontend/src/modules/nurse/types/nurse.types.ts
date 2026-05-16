/**
 * MedTrustX — Staff Nurse Types
 * Precision-driven care execution, patient monitoring, and safety-first task completion
 */

export interface NurseKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface NursePatient {
  id: string;
  name: string;
  bed: string;
  status: 'stable' | 'observation' | 'critical';
  nextTaskTime: string;
  alerts: number;
}

export interface NurseTask {
  id: string;
  title: string;
  type: 'medication' | 'vitals' | 'procedure' | 'care';
  patientId: string;
  patientName: string;
  bed: string;
  status: 'pending' | 'in_progress' | 'completed';
  time: string;
  priority: 'high' | 'medium' | 'low';
  requiresValidation: boolean;
}

export interface NurseAlert {
  id: string;
  type: 'abnormal_vitals' | 'missed_medication' | 'safety';
  message: string;
  patientId: string;
  patientName: string;
  bed: string;
  priority: 'high' | 'medium';
}

export interface NurseDashboardData {
  kpis: NurseKPI[];
  patients: NursePatient[];
  tasks: NurseTask[];
  alerts: NurseAlert[];
}
