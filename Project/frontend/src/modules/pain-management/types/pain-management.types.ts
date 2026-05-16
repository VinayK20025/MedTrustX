/**
 * MedTrustX — Pain Management Specialist (Role 144) Types
 * Multimodal pain assessment, treatment planning, and monitoring.
 */

export interface PainPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  primaryDiagnosis: string;
  painType: 'Acute' | 'Chronic' | 'Neuropathic' | 'Cancer' | 'Mixed';
  currentPainScore: number; // 0-10
  status: 'Active' | 'Stable' | 'Discharged';
  lastAssessment: string;
}

export interface PainAssessment {
  id: string;
  patientId: string;
  score: number;
  scaleType: 'VAS' | 'NRS' | 'Faces';
  duration: string;
  location: string;
  characteristics: string[];
  assessedAt: string;
  notes: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  medications: { name: string; dosage: string; frequency: string }[];
  therapies: { type: string; frequency: string }[];
  startDate: string;
  status: 'Active' | 'Completed' | 'Modified';
}

export interface PainProcedure {
  id: string;
  patientId: string;
  type: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  outcome?: string;
  performedBy?: string;
}

export interface PainMetrics {
  patientsTreated: number;
  proceduresDone: number;
  avgPainReduction: number;
  followUpsDue: number;
}

export interface PainData {
  metrics: PainMetrics;
  patients: PainPatient[];
  recentAssessments: PainAssessment[];
  activePlans: TreatmentPlan[];
  procedures: PainProcedure[];
}
