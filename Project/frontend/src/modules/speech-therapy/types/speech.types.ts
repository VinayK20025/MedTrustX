/**
 * MedTrustX — Speech Therapist Types
 */

export interface SpeechKPI {
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

export interface SpeechPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  diagnosis: string;
  communicationLevel: 'Non-verbal' | 'Limited' | 'Functional' | 'Fluent';
  therapyStatus: 'Active' | 'Discharged' | 'Pending Assessment';
  lastSessionDate: string;
  nextSessionDate: string;
  assignedTherapist: string;
}

export interface SpeechAssessment {
  id: string;
  patientId: string;
  date: string;
  type: 'Speech' | 'Language' | 'Swallowing';
  articulationScore: number; // 0-100
  fluencyScore: number; // 0-100
  comprehensionScore: number; // 0-100
  swallowingScore: number; // 0-10
  notes: string;
  therapistId: string;
}

export interface SpeechExercise {
  id: string;
  name: string;
  targetArea: 'Articulation' | 'Fluency' | 'Comprehension' | 'Swallowing';
  frequency: string;
  instructions: string;
}

export interface SpeechTherapyPlan {
  id: string;
  patientId: string;
  startDate: string;
  endDate: string;
  goals: string[];
  exercises: SpeechExercise[];
  status: 'Active' | 'Completed' | 'Modified';
  progressPercentage: number;
}

export interface SpeechSession {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'Speech Therapy' | 'Language Therapy' | 'Swallowing Therapy';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Missed';
  notes: string;
  activities: string[];
}

export interface SpeechEducationMaterial {
  id: string;
  title: string;
  category: 'Articulation' | 'Fluency' | 'Swallowing' | 'General';
  description: string;
  format: 'Video' | 'PDF' | 'Audio';
  url: string;
}

export interface SpeechDashboardData {
  kpis: SpeechKPI[];
  patients: SpeechPatient[];
  activePlan?: SpeechTherapyPlan;
  sessionsToday: SpeechSession[];
  assessments: SpeechAssessment[];
  progressMetrics: { date: string; clarity: number; comprehension: number; fluency: number }[];
  educationMaterials: SpeechEducationMaterial[];
}
