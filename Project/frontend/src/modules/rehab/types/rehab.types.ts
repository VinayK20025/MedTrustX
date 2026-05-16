/**
 * MedTrustX — Rehab (Physiotherapist / Occupational Therapist) Types
 */

export interface RehabKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface RehabPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  diagnosis: string;
  condition: string;
  mobilityScore: number; // 0-100
  painLevel: number; // 0-10
  therapyStatus: 'Active' | 'Discharged' | 'Pending Assessment';
  lastSessionDate: string;
  nextSessionDate: string;
  assignedTherapist: string;
}

export interface RehabAssessment {
  id: string;
  patientId: string;
  date: string;
  type: 'Initial' | 'Reassessment' | 'Discharge';
  romScore: number; // Range of Motion
  strengthScore: number; // 0-5 scale typical
  painScale: number; // 0-10
  independenceScore: number; // FIM or similar 0-100
  notes: string;
  therapistId: string;
}

export interface RehabExercise {
  id: string;
  name: string;
  targetArea: string;
  sets: number;
  reps: number;
  frequency: string;
  instructions: string;
  videoUrl?: string;
}

export interface RehabTherapyPlan {
  id: string;
  patientId: string;
  startDate: string;
  endDate: string;
  goals: string[];
  exercises: RehabExercise[];
  status: 'Active' | 'Completed' | 'Modified';
  progressPercentage: number;
}

export interface RehabSession {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'Physical Therapy' | 'Occupational Therapy';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Missed';
  notes: string;
  painLevelBefore: number;
  painLevelAfter: number;
}

export interface RehabEducationMaterial {
  id: string;
  title: string;
  category: 'Exercise' | 'Post-op Care' | 'Mobility Aids' | 'General';
  description: string;
  format: 'Video' | 'PDF' | 'Article';
  url: string;
}

export interface RehabDashboardData {
  kpis: RehabKPI[];
  patients: RehabPatient[];
  activePlan?: RehabTherapyPlan;
  sessionsToday: RehabSession[];
  assessments: RehabAssessment[];
  progressMetrics: { date: string; mobility: number; pain: number; independence: number }[];
  educationMaterials: RehabEducationMaterial[];
}
