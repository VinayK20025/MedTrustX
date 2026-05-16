/**
 * MedTrustX — Doctor Module Types
 * Patient-centric Clinical domain models
 */

export interface DoctorKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical';
  delta?: string;
}

export interface MyPatient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  type: 'opd' | 'ipd';
  ward?: string;
  bed?: string;
  diagnosis: string;
  status: 'active' | 'critical' | 'stable' | 'discharge_ready';
  admittedAt: string;
  lastUpdated: string;
  pendingActions: number;
  allergies: string[];
}

export interface PatientVitalsSnapshot {
  hr: number;
  bp: string;
  spo2: number;
  rr: number;
  temp: number;
}

export interface TimelineEntry {
  id: string;
  type: 'consultation' | 'medication' | 'lab' | 'procedure' | 'note' | 'vitals_alert';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface LabResult {
  id: string;
  test: string;
  value: string;
  unit: string;
  reference: string;
  status: 'normal' | 'abnormal' | 'critical';
  reportedAt: string;
}

export interface Prescription {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  status: 'active' | 'completed' | 'discontinued';
}

export interface Appointment {
  id: string;
  patientName: string;
  type: 'opd' | 'follow_up' | 'round';
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'no_show';
}

export interface DoctorAlert {
  id: string;
  type: 'vitals' | 'lab' | 'medication' | 'task';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  patientName?: string;
  timestamp: string;
}

export interface DoctorDashboardData {
  kpis: DoctorKPI[];
  patients: MyPatient[];
  appointments: Appointment[];
  alerts: DoctorAlert[];
  recentTimeline: TimelineEntry[];
}

export interface PatientDetailData {
  patient: MyPatient;
  vitals: PatientVitalsSnapshot;
  timeline: TimelineEntry[];
  labs: LabResult[];
  prescriptions: Prescription[];
}
