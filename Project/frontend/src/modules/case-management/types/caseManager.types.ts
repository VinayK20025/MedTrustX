/**
 * MedTrustX — Case Manager Types
 */

export interface CaseManagerKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'currency' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface ActiveCase {
  id: string;
  patientName: string;
  mrn: string;
  admissionDate: string;
  currentLOS: number; // Length of Stay in days
  expectedLOS: number;
  dischargeStatus: 'Planning' | 'Pending Clearance' | 'Ready' | 'Delayed';
  caseCost: number;
}

export interface DischargePlan {
  id: string;
  caseId: string;
  targetDate: string;
  clinicalClearance: boolean;
  billingClearance: boolean;
  medicationReconciliation: boolean;
  postAcuteCare: 'Home' | 'Rehab' | 'SNF';
  readinessScore: number; // 0-100%
}

export interface InsuranceApproval {
  id: string;
  caseId: string;
  payerName: string;
  authNumber: string;
  status: 'Approved' | 'Pending' | 'Denied' | 'Appealing';
  daysApproved: number;
  estimatedCoverage: number;
}

export interface CaseAlert {
  id: string;
  type: 'LOS Exceeded' | 'Insurance Denied' | 'Discharge Blocked';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
  caseId: string;
}

export interface CaseManagerDashboardData {
  kpis: CaseManagerKPI[];
  activeCases: ActiveCase[];
  activeDischargePlan?: DischargePlan;
  activeInsurance?: InsuranceApproval;
  alerts: CaseAlert[];
}
