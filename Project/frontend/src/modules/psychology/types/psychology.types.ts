/**
 * MedTrustX — Clinical Psychologist / Counselor Types
 */

export interface PsychologyKPI {
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

export interface PsychologyPatient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  diagnosis: string; // e.g., Major Depressive Disorder, GAD, PTSD
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  status: 'Active' | 'Archived';
  lastSessionDate: string;
  nextSessionDate: string;
}

export interface PsychologyAssessment {
  id: string;
  patientId: string;
  date: string;
  type: 'PHQ-9' | 'GAD-7' | 'BDI' | 'PCL-5';
  score: number;
  interpretation: string;
  severity: 'None' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe';
}

export interface PsychologySession {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'Initial Intake' | 'CBT' | 'EMDR' | 'Psychotherapy' | 'Follow-up';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  format: 'In-person' | 'Telehealth';
}

export interface PsychologyNote {
  id: string;
  sessionId: string;
  patientId: string;
  date: string;
  observations: string; // Objective
  patientStatements: string; // Subjective
  therapistInsights: string; // Assessment
  plan: string; // Plan
  status: 'Draft' | 'Signed';
}

export interface PsychologyConfidentialNote {
  id: string;
  patientId: string;
  date: string;
  content: string; // Highly restricted, encrypted field
  isEncrypted: boolean;
  lastAccessed: string;
}

export interface PsychologyDashboardData {
  kpis: PsychologyKPI[];
  patients: PsychologyPatient[];
  sessionsToday: PsychologySession[];
  recentNotes: PsychologyNote[];
  confidentialAlerts: number;
  assessments: PsychologyAssessment[];
  progressMetrics: { date: string; phq9: number; gad7: number; moodScore: number }[];
}
