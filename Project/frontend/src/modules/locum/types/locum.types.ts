/**
 * MedTrustX — Locum Doctor Module Types
 * Context-compressed continuity of care models
 */

export interface LocumKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface AssignedPatient {
  id: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnosis: string;
  ward: string;
  bed: string;
  lastUpdate: string;
  riskFlag: 'stable' | 'watch' | 'critical';
  handoverPending: boolean;
}

export interface PatientSnapshot {
  id: string;
  patientName: string;
  allergies: string[];
  primaryDiagnosis: string;
  currentPlan: string[];
  keyHistory: {
    date: string;
    event: string;
  }[];
  activeMeds: {
    name: string;
    dosage: string;
    schedule: string;
  }[];
  alerts: string[];
  vitals: {
    hr: number;
    bp: string;
    temp: number;
    spo2: number;
  };
}

export interface HandoverTask {
  id: string;
  patientId: string;
  patientName: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
}

export interface HandoverSummary {
  incomingNotes: string;
  warnings: string[];
  pendingTasks: HandoverTask[];
}

export interface LocumDashboardData {
  kpis: LocumKPI[];
  assignedPatients: AssignedPatient[];
  activeSnapshot: PatientSnapshot | null;
  handover: HandoverSummary;
}
