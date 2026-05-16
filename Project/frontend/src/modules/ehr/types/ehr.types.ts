/**
 * MedTrustX — EHR System Operator (Role 98) Types
 */

export interface EhrKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'text' | 'percentage' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type PatientStatus = 'Active' | 'Discharged' | 'Pending Review';

export interface EhrPatient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: string;
  status: PatientStatus;
  department: string;
  lastUpdated: string;
  hasDuplicates?: boolean;
}

export interface EhrRecordData {
  vitals?: { bp: string; hr: string; temp: string };
  notes?: string;
  diagnosis?: string;
}

export interface EhrValidationError {
  id: string;
  field: string;
  message: string;
  severity: 'Warning' | 'Error';
}

export interface EhrAuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface MpiRecord {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  facility: string;
  status: 'Verified' | 'Potential Duplicate' | 'Demographic Error';
  confidenceScore: number;
  duplicates: number;
}

export interface EhrDashboardData {
  kpis: EhrKPI[];
  patients: EhrPatient[];
  mpiRecords?: MpiRecord[];
}
