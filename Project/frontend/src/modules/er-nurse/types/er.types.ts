/**
 * MedTrustX — ER Nurse Types
 * High-speed triage, emergency care actions, and survival metrics
 */

export interface ERKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export type TriageLevel = 'critical' | 'urgent' | 'stable';

export interface ERTriagePatient {
  id: string;
  name: string;
  symptoms: string;
  arrivalTime: string;
  triageLevel: TriageLevel;
  waitTimeMins: number;
}

export interface ERActivePatient {
  id: string;
  name: string;
  location: string;
  status: 'resus' | 'treatment' | 'waiting_transfer';
  chiefComplaint: string;
  alerts: number;
}

export interface ERCareAction {
  id: string;
  title: string;
  type: 'oxygen' | 'iv_fluid' | 'ecg' | 'injection' | 'protocol';
  patientId?: string;
  status: 'ready' | 'in_progress' | 'completed';
}

export interface ERAlert {
  id: string;
  type: 'cardiac_arrest' | 'vitals_drop' | 'delay' | 'incoming_trauma';
  message: string;
  location?: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface ERDashboardData {
  kpis: ERKPI[];
  triageQueue: ERTriagePatient[];
  activePatients: ERActivePatient[];
  careActions: ERCareAction[];
  alerts: ERAlert[];
}
