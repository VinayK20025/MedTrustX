/**
 * MedTrustX — Admission Officer & Appointment Scheduler (Role 74) Types
 */

export interface AdmissionSchedulerKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

/* ── Scheduling Types ── */

export interface DoctorSchedule {
  doctorId: string;
  doctorName: string;
  department: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  time: string;
  status: 'Available' | 'Booked' | 'Tentative' | 'Blocked';
  patientName?: string;
  patientMrn?: string;
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  mrn: string;
  preferredDoctor: string;
  preferredTime: string;
  priority: 'Normal' | 'Urgent';
  addedAt: string;
}

/* ── Admission Types ── */

export type AdmissionStep = 'patient' | 'details' | 'bed' | 'insurance' | 'confirm';

export interface AdmissionFormData {
  patientMrn: string;
  patientName: string;
  admissionType: 'Planned' | 'Emergency';
  department: string;
  attendingDoctor: string;
  reason: string;
  bedId?: string;
  bedLabel?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  preAuthStatus?: 'Pending' | 'Approved' | 'Denied';
}

export interface BedUnit {
  id: string;
  label: string;
  ward: 'ICU' | 'General Ward' | 'Private Room' | 'Semi-Private';
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Reserved';
  department: string;
}

export interface ActiveAdmission {
  id: string;
  patientName: string;
  mrn: string;
  department: string;
  bed: string;
  admittedAt: string;
  attendingDoctor: string;
  status: 'Active' | 'Discharge Planned' | 'Discharged';
}

export interface AdmissionSchedulerDashboardData {
  kpis: AdmissionSchedulerKPI[];
  doctorSchedules: DoctorSchedule[];
  waitlist: WaitlistEntry[];
  beds: BedUnit[];
  activeAdmissions: ActiveAdmission[];
}
