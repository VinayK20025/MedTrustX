/**
 * MedTrustX — Ambulance Paramedic (Role 121) Types
 * Pre-hospital clinical decision support, rapid interventions, and ER communication.
 */

export interface ParamedicKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface ActiveCase {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  complaint: string;
  triageLevel: 'Critical' | 'Urgent' | 'Stable';
  timeEnRoute: string; // e.g. "12 mins"
}

export interface ClinicalProtocol {
  id: string;
  condition: string;
  suggestedActions: string[];
  isCompleted: boolean;
}

export interface InterventionLog {
  id: string;
  action: string;
  time: string;
  details?: string;
  status: 'Administered' | 'Failed';
}

export interface ParamedicVitals {
  id: string;
  bp: string;
  hr: number;
  spo2: number;
  temp: number;
  recordedAt: string;
  isAbnormal: boolean;
}

export interface ParamedicData {
  kpis: ParamedicKPI[];
  activeCase: ActiveCase | null;
  protocols: ClinicalProtocol[];
  interventions: InterventionLog[];
  vitalsHistory: ParamedicVitals[];
}
