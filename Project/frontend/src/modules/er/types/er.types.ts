/**
 * MedTrustX — Emergency Physician Module Types
 * Real-time triage and life-saving command models
 */

export interface ERKpi {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface TriagePatient {
  id: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  symptoms: string;
  arrivalTime: string; // ISO
  waitingTime: number; // minutes
  priority: 'critical' | 'urgent' | 'stable';
  status: 'waiting' | 'in_treatment' | 'discharged' | 'admitted';
}

export interface CriticalPatient {
  id: string;
  patientName: string;
  age: number;
  diagnosis: string;
  location: string; // e.g., Resus 1, Trauma Bay
  vitals: {
    hr: number;
    bp: string;
    spo2: number;
    rr: number;
    gcs?: number;
  };
  interventions: string[];
  alerts: string[];
}

export interface ERResourceStatus {
  id: string;
  type: 'icu_beds' | 'ot_availability' | 'vents' | 'blood_bank';
  label: string;
  available: number;
  total: number;
  status: 'critical' | 'warning' | 'normal';
}

export interface ERAlert {
  id: string;
  type: 'code_blue' | 'vitals_drop' | 'new_trauma' | 'lab_critical';
  severity: 'critical' | 'warning';
  message: string;
  patientName?: string;
  timestamp: string;
}

export interface ERDashboardData {
  kpis: ERKpi[];
  triageQueue: TriagePatient[];
  criticalPatients: CriticalPatient[];
  resources: ERResourceStatus[];
  alerts: ERAlert[];
}
