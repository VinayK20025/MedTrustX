/**
 * MedTrustX — Auxiliary Nurse Midwife (ANM) Types
 * Community-based maternal and child healthcare tracking
 */

export interface ANMKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export type ANMPatientType = 'pregnant_woman' | 'child' | 'general';

export interface ANMPatient {
  id: string;
  name: string;
  type: ANMPatientType;
  village: string;
  status: string; // e.g. '3rd Trimester', 'Vaccination Due'
  priority: 'high' | 'normal';
  lastVisit: string;
}

export interface ANMVisit {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: 'anc_visit' | 'immunization' | 'growth_monitoring' | 'general';
  notes: string;
  synced: boolean;
}

export interface ANMAlert {
  id: string;
  type: 'missed_visit' | 'overdue_vaccine' | 'high_risk_pregnancy';
  message: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface ANMDashboardData {
  kpis: ANMKPI[];
  patients: ANMPatient[];
  recentVisits: ANMVisit[];
  alerts: ANMAlert[];
}
