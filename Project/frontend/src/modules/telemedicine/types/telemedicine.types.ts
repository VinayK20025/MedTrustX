/**
 * MedTrustX — Telemedicine Doctor (Role 132) Types
 * Virtual consultations, e-prescriptions, and remote patient management.
 */

export interface TelmedKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface QueuedPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  complaint: string;
  status: 'Waiting' | 'In Consult' | 'Completed';
  scheduledTime: string;
  allergies?: string[];
  connectionQuality: 'Good' | 'Fair' | 'Poor';
}

export interface PrescriptionItem {
  id: string;
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface TelmedData {
  kpis: TelmedKPI[];
  queue: QueuedPatient[];
  templates: PrescriptionItem[];
}
