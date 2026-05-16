/**
 * MedTrustX — Clinical Director / Unit Head Module Types
 * Real-time Critical Care domain models (ICU, ER, OT, Dialysis)
 */

export interface UnitKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface PatientVitals {
  hr: number;       // heart rate
  bp: string;       // e.g. "120/80"
  spo2: number;     // oxygen saturation
  rr: number;       // respiratory rate
  temp: number;     // temperature °C
  gcs?: number;     // Glasgow Coma Scale (ICU)
}

export interface BedPatient {
  id: string;
  bed: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  diagnosis: string;
  severity: 'critical' | 'serious' | 'moderate' | 'stable';
  vitals: PatientVitals;
  ventilator: boolean;
  alerts: string[];
  admittedAt: string;
  attendingDoctor: string;
  nurse: string;
}

export interface UnitStaff {
  id: string;
  name: string;
  role: 'intensivist' | 'registrar' | 'nurse' | 'respiratory_therapist';
  status: 'on_duty' | 'on_call' | 'break';
  assignedBeds: string[];
  shift: string;
}

export interface UnitAlert {
  id: string;
  type: 'code_blue' | 'vitals_critical' | 'ventilator' | 'medication_delay' | 'lab_critical' | 'escalation';
  severity: 'critical' | 'warning';
  message: string;
  bed?: string;
  patientName?: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface UnitHeadDashboardData {
  unitName: string;
  unitType: 'icu' | 'er' | 'ot' | 'dialysis';
  kpis: UnitKPI[];
  patients: BedPatient[];
  staff: UnitStaff[];
  alerts: UnitAlert[];
}
