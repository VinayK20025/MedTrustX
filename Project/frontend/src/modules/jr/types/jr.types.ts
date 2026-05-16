/**
 * MedTrustX — Junior Resident Module Types
 * Guided clinical execution and training models
 */

export interface JRKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface JRPatient {
  id: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnosis: string;
  status: 'stable' | 'needs_review' | 'critical';
  assignedBy: string; // Supervisor name
}

export interface TaskStep {
  id: string;
  instruction: string;
  isCompleted: boolean;
  requiresConfirmation?: boolean;
}

export interface GuidedTask {
  id: string;
  title: string;
  patientId: string;
  patientName: string;
  supervisor: string;
  protocolLink?: string;
  status: 'pending' | 'in_progress' | 'completed';
  steps: TaskStep[];
}

export interface LearningProtocol {
  id: string;
  title: string;
  category: 'guideline' | 'procedure' | 'medication';
  summary: string;
}

export interface JRAlert {
  id: string;
  message: string;
  type: 'supervisor_note' | 'escalation_required';
  timestamp: string;
}

export interface JRDashboardData {
  kpis: JRKPI[];
  patients: JRPatient[];
  tasks: GuidedTask[];
  protocols: LearningProtocol[];
  alerts: JRAlert[];
}
