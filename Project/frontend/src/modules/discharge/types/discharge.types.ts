/**
 * MedTrustX — Discharge Coordinator (Role 75) Types
 */

export interface DischargeKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type ClearanceStatus = 'Pending' | 'In Progress' | 'Cleared' | 'Blocked';

export interface DischargeClearance {
  department: 'Doctor' | 'Nursing' | 'Pharmacy' | 'Billing' | 'Documentation' | 'Final Approval';
  status: ClearanceStatus;
  clearedBy?: string;
  clearedAt?: string;
  blockerReason?: string;
}

export interface DischargePatient {
  id: string;
  patientName: string;
  mrn: string;
  ward: string;
  bed: string;
  attendingDoctor: string;
  admittedAt: string;
  dischargeInitiatedAt: string;
  overallProgress: number; // 0-100
  status: 'Pending' | 'In Progress' | 'Ready' | 'Completed' | 'Delayed';
  clearances: DischargeClearance[];
}

export interface DischargeBillingSummary {
  totalCharges: number;
  insuranceCovered: number;
  patientPaid: number;
  outstanding: number;
  status: 'Cleared' | 'Partial' | 'Unpaid';
}

export interface DischargeDocument {
  id: string;
  name: string;
  type: 'Discharge Summary' | 'Prescription' | 'Lab Report' | 'Imaging Report';
  status: 'Ready' | 'Missing' | 'Draft';
}

export interface DischargeDashboardData {
  kpis: DischargeKPI[];
  patients: DischargePatient[];
  billing?: DischargeBillingSummary;
  documents: DischargeDocument[];
}
