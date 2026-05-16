/**
 * MedTrustX — General Physician Module Types
 * High-speed triage and initial diagnosis domain models
 */

export interface GPKpi {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface OPDQueuePatient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  symptoms: string;
  waitingTime: number; // in minutes
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'waiting' | 'in_consultation' | 'completed';
  checkedInAt: string;
}

export interface ConsultationVitals {
  hr?: number;
  bp?: string;
  temp?: number;
  spo2?: number;
}

export interface CurrentConsultation {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  vitals: ConsultationVitals;
  allergies: string[];
  alerts: string[];
}

export interface QuickPrescriptionPreset {
  id: string;
  name: string;
  drug: string;
  dosage: string;
  duration: string;
}

export interface GPAlert {
  id: string;
  type: 'wait_time' | 'vitals' | 'walk_in';
  message: string;
  patientName?: string;
  timestamp: string;
  severity: 'warning' | 'critical';
}

export interface GPDashboardData {
  kpis: GPKpi[];
  queue: OPDQueuePatient[];
  currentConsultation: CurrentConsultation | null;
  alerts: GPAlert[];
  presets: QuickPrescriptionPreset[];
}
