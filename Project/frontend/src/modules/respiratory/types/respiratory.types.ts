/**
 * MedTrustX — Respiratory Therapist Types
 */

export interface RespiratoryKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  actionLabel?: string;
  actionUrl?: string;
}

export interface RespiratoryPatient {
  id: string;
  name: string;
  bed: string;
  department: 'ICU' | 'NICU' | 'Pulmonology' | 'ER';
  diagnosis: string;
  deviceConnected: string | null;
  respiratoryStatus: 'Stable' | 'Guarded' | 'Critical';
  oxygenLevel: number; // SpO2 percentage
  lastIntervention: string;
}

export interface RespiratoryDevice {
  id: string;
  type: 'Ventilator' | 'Oxygen Concentrator' | 'CPAP' | 'BiPAP' | 'High Flow Nasal Cannula';
  patientId: string | null;
  bedLocation: string;
  status: 'Active' | 'Standby' | 'Maintenance' | 'Alarm';
  mode?: string; // e.g., 'SIMV', 'AC', 'CPAP'
  fio2?: number; // Fraction of Inspired Oxygen %
  peep?: number; // Positive End-Expiratory Pressure
  tidalVolume?: number; // mL
  respiratoryRate?: number; // Set RR
}

export interface RespiratoryVitals {
  patientId: string;
  timestamp: string;
  spO2: number; // %
  respiratoryRate: number; // breaths per minute
  tidalVolume: number; // mL
  etco2?: number; // End-tidal CO2 mmHg
}

export interface RespiratoryTherapy {
  id: string;
  patientId: string;
  type: 'Oxygen Therapy' | 'Nebulization' | 'Incentive Spirometry';
  medication?: string;
  frequency: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  lastAdministered: string;
}

export interface RespiratoryProcedure {
  id: string;
  patientId: string;
  name: 'Intubation' | 'Extubation' | 'Suctioning' | 'Airway Clearance';
  status: 'Pending' | 'In Progress' | 'Completed';
  scheduledTime: string;
  notes: string;
}

export interface RespiratoryAlert {
  id: string;
  patientId: string;
  deviceId?: string;
  type: 'Desaturation' | 'Apnea' | 'High Pressure' | 'Low Volume' | 'Disconnect';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  description: string;
}

export interface RespiratoryDashboardData {
  kpis: RespiratoryKPI[];
  patients: RespiratoryPatient[];
  devices: RespiratoryDevice[];
  liveVitals: RespiratoryVitals[];
  therapies: RespiratoryTherapy[];
  procedures: RespiratoryProcedure[];
  alerts: RespiratoryAlert[];
}
