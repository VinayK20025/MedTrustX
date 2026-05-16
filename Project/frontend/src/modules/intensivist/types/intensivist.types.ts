/**
 * MedTrustX — Visiting Intensivist Module Types
 * High-signal expert review system models
 */

export interface IntensivistKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface ICUConsultCase {
  id: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  unit: string; // e.g., Neuro ICU
  diagnosis: string;
  riskScore: number; // e.g., APACHE II or SOFA score
  keyIssue: string;
  priority: 'critical' | 'high_risk' | 'stable';
  status: 'pending_review' | 'reviewed';
}

export interface VitalsTrend {
  timestamp: string;
  hr: number;
  bpSys: number;
  bpDia: number;
  spo2: number;
  temp: number;
}

export interface LabResultSummary {
  id: string;
  testName: string;
  value: string;
  unit: string;
  status: 'normal' | 'abnormal' | 'critical';
  trend: 'up' | 'down' | 'stable';
  time: string;
}

export interface ActivePatientDetails {
  caseInfo: ICUConsultCase;
  history: string;
  currentMeds: string[];
  vitalsHistory: VitalsTrend[];
  labs: LabResultSummary[];
}

export interface RecommendationDraft {
  priority: 'routine' | 'high' | 'immediate';
  note: string;
}

export interface IntensivistDashboardData {
  kpis: IntensivistKPI[];
  cases: ICUConsultCase[];
  activeReview: ActivePatientDetails | null;
}
