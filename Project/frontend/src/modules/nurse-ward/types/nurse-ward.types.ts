/**
 * MedTrustX — Staff Nurse (Ward) (Role 118) Types
 * Bedside patient care, vitals monitoring, medication administration, and task execution.
 */

export interface NurseKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface WardPatient {
  id: string;
  mrn: string;
  name: string;
  bed: string;
  age: number;
  gender: string;
  diagnosis: string;
  status: 'Stable' | 'Observation' | 'Critical';
  allergies?: string[];
}

export interface MedicationTask {
  id: string;
  patientId: string;
  drug: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  status: 'Pending' | 'Administered' | 'Missed';
}

export interface CareTask {
  id: string;
  patientId: string;
  task: string;
  priority: 'High' | 'Normal';
  status: 'Pending' | 'Completed';
  timeframe: string;
}

export interface PatientVitals {
  id: string;
  patientId: string;
  bp: string;
  hr: number;
  temp: number;
  spo2: number;
  recordedAt: string;
  isAbnormal: boolean;
}

export interface ClinicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  bed: string;
  type: 'Vitals Critical' | 'Medication Overdue';
  message: string;
  timestamp: string;
}

export interface NurseWardData {
  kpis: NurseKPI[];
  patients: WardPatient[];
  medications: MedicationTask[];
  tasks: CareTask[];
  vitals: PatientVitals[];
  alerts: ClinicalAlert[];
}
