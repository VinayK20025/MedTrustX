/**
 * MedTrustX — ICU Nurse Types
 * Real-time life-support, live vitals, and critical alert models
 */

export interface ICUKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface ICUVitals {
  hr: number;
  bp: string;
  spo2: number;
  resp: number;
  temp: number;
}

export interface ICUPatient {
  id: string;
  name: string;
  bed: string;
  status: 'stable' | 'warning' | 'critical';
  vitals: ICUVitals;
  activeAlerts: number;
  diagnosis: string;
}

export interface ICUTask {
  id: string;
  title: string;
  patientId: string;
  bed: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  time: string;
}

export interface ICUAlert {
  id: string;
  type: 'vitals_drop' | 'cardiac_event' | 'missed_medication' | 'system';
  message: string;
  patientId: string;
  bed: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface ICUDashboardData {
  kpis: ICUKPI[];
  patients: ICUPatient[];
  tasks: ICUTask[];
  alerts: ICUAlert[];
}
