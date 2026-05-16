/**
 * MedTrustX — OT Manager / Surgeon Types
 */

export interface SurgeonKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface SurgicalCase {
  id: string;
  patientName: string;
  mrn: string;
  procedure: string;
  type: 'Elective' | 'Urgent' | 'Emergency';
  otRoom: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Pre-Op' | 'In Progress' | 'Recovery' | 'Completed';
  estimatedDuration: number; // minutes
  surgeonRole: 'Primary' | 'Assistant';
}

export interface PreOpReview {
  caseId: string;
  patientId: string;
  diagnosis: string;
  history: string;
  clearanceStatus: 'Cleared' | 'Pending Consults' | 'Not Cleared';
  imagingAvailable: boolean;
  labsReviewed: boolean;
  bloodMatched: boolean;
  surgicalPlan: string;
}

export interface IntraOpVitals {
  caseId: string;
  timestamp: string;
  heartRate: number;
  bloodPressure: { sys: number; dia: number };
  spO2: number;
  etco2: number;
  temp: number;
  anesthesiaDepth: number; // BIS score
}

export interface SurgicalStep {
  id: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  timestamp?: string;
}

export interface ActiveSurgery {
  caseId: string;
  startTime: string;
  durationMinutes: number;
  currentPhase: 'Incision' | 'Dissection' | 'Resection' | 'Reconstruction' | 'Closure';
  steps: SurgicalStep[];
  bloodLoss: number; // mL
  fluidsGiven: number; // mL
  complications: string[];
}

export interface PostOpNote {
  id: string;
  caseId: string;
  date: string;
  surgeonId: string;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  procedurePerformed: string;
  findings: string;
  complications: string;
  status: 'Draft' | 'Signed';
  dictationAudioUrl?: string;
}

export interface SurgicalAlert {
  id: string;
  caseId: string;
  type: 'Hemodynamic Instability' | 'Desaturation' | 'Equipment Failure' | 'Time Warning';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Resolved';
  message: string;
}

export interface SurgeonDashboardData {
  kpis: SurgeonKPI[];
  casesToday: SurgicalCase[];
  activeSurgery?: ActiveSurgery;
  liveVitals?: IntraOpVitals;
  preOpReviews: PreOpReview[];
  postOpNotes: PostOpNote[];
  alerts: SurgicalAlert[];
}
