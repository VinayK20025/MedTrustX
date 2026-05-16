/**
 * MedTrustX — Medical Intern Module Types
 * Learning-first, read-only, supervised execution models
 */

export interface InternKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface InternPatient {
  id: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnosis: string; // Simplified
  status: 'stable' | 'observation' | 'critical';
  permissions: string[]; // e.g. ['read_only']
}

export interface InternTask {
  id: string;
  title: string;
  patientName: string;
  supervisor: string;
  status: 'pending' | 'draft_submitted' | 'approved';
  requiresApproval: boolean;
}

export interface InternLearningModule {
  id: string;
  title: string;
  category: 'protocol' | 'case_study' | 'guideline';
  contextMatch: string; // e.g. "Matches Patient P1 - Pneumonia"
  completionPercentage: number;
}

export interface InternFeedback {
  id: string;
  supervisor: string;
  date: string;
  rating: number; // 1-5
  comment: string;
}

export interface InternDashboardData {
  kpis: InternKPI[];
  assignedPatients: InternPatient[];
  assistedTasks: InternTask[];
  learningModules: InternLearningModule[];
  feedback: InternFeedback[];
}
