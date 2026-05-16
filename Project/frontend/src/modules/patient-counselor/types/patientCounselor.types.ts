/**
 * MedTrustX — Patient Counselor Types
 */

export interface CounselorKPI {
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

export interface CounseledPatient {
  id: string;
  patientName: string;
  mrn: string;
  diagnosis: string;
  physician: string;
  status: 'Waiting' | 'In Session' | 'Decision Pending' | 'Counseling Complete';
  appointmentTime: string;
}

export interface TreatmentExplanation {
  id: string;
  title: string;
  plainLanguageSummary: string;
  duration: string;
  successRate?: string;
  risks: string[];
  alternatives: string[];
}

export interface FinancialEstimate {
  id: string;
  procedureName: string;
  grossCost: number;
  insuranceCoverage: number;
  patientOut_of_Pocket: number;
  paymentOptions: string[];
  isApprovedByPayer: boolean;
}

export interface CounselingSession {
  id: string;
  patientId: string;
  talkingPoints: {
    id: string;
    topic: 'Diagnosis' | 'Treatment' | 'Cost' | 'Follow-up';
    content: string;
    discussed: boolean;
  }[];
  notes: string;
  patientConcerns: string[];
}

export interface PatientCounselorDashboardData {
  kpis: CounselorKPI[];
  patients: CounseledPatient[];
  activeSession?: CounselingSession;
  activeTreatment?: TreatmentExplanation;
  activeEstimate?: FinancialEstimate;
}
