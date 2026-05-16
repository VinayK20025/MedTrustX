/**
 * MedTrustX — Medical Records Officer (MRO) Types
 */

export interface MroKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PatientRecord {
  id: string;
  patientName: string;
  mrn: string;
  encounterType: 'Inpatient' | 'Outpatient' | 'ER';
  status: 'Complete' | 'Incomplete' | 'Pending Coding';
  completionPercentage: number;
  dischargeDate: string;
}

export interface CodingData {
  id: string;
  recordId: string;
  clinicalNotes: string;
  suggestedICDCodes: { code: string; description: string; confidence: number }[];
  suggestedCPTCodes: { code: string; description: string; confidence: number }[];
  assignedICD: string[];
  assignedCPT: string[];
  codingStatus: 'Pending' | 'Draft' | 'Finalized';
}

export interface ValidationDeficiency {
  id: string;
  recordId: string;
  severity: 'warning' | 'critical';
  category: 'Missing Signature' | 'Missing Document' | 'Incomplete Note' | 'Conflict';
  description: string;
  assignedPhysician: string;
  status: 'Open' | 'Resolved';
}

export interface MroDashboardData {
  kpis: MroKPI[];
  records: PatientRecord[];
  activeCoding?: CodingData;
  deficiencies: ValidationDeficiency[];
}
