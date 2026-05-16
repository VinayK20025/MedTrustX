/**
 * MedTrustX — Senior Resident Module Types
 * Clinical operations, team supervision, and task control models
 */

export interface SRKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface SRPatient {
  id: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnosis: string;
  status: 'critical' | 'watch' | 'stable';
  ward: string;
  bed: string;
}

export interface SRTask {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  assignedTo?: string; // JR name
  status: 'unassigned' | 'assigned' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueTime: string;
}

export interface SRTeamMember {
  id: string;
  name: string;
  role: 'JR' | 'Intern';
  patientsAssigned: number;
  tasksInProgress: number;
  tasksDelayed: number;
  status: 'active' | 'busy' | 'offline';
}

export interface SRAlert {
  id: string;
  patientName: string;
  message: string;
  severity: 'critical' | 'warning';
  timestamp: string;
}

export interface SRDashboardData {
  kpis: SRKPI[];
  patients: SRPatient[];
  tasks: SRTask[];
  team: SRTeamMember[];
  alerts: SRAlert[];
}
