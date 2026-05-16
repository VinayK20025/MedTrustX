/**
 * MedTrustX — Infection Control Nurse (Role 104) Types
 * Frontline execution for bedside infection prevention, audits, and surveillance.
 */

export type IcnTaskPriority = 'High' | 'Medium' | 'Low';
export type IcnTaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface IcnKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface IcnTask {
  id: string;
  title: string;
  type: 'Hygiene Audit' | 'PPE Audit' | 'Surveillance Check' | 'Isolation Setup' | 'Training';
  ward: string;
  priority: IcnTaskPriority;
  status: IcnTaskStatus;
  dueAt: string;
}

export interface AuditChecklistItem {
  id: string;
  label: string;
  status: 'Pass' | 'Fail' | 'Pending';
  notes?: string;
}

export interface IcnAudit {
  id: string;
  taskId: string;
  ward: string;
  type: 'Hygiene' | 'PPE' | 'Sterilization';
  items: AuditChecklistItem[];
  status: 'Draft' | 'Submitted';
}

export interface IcnPatientSurveillance {
  id: string;
  patientTag: string;
  ward: string;
  bed: string;
  infectionRisk: 'High' | 'Moderate' | 'Low';
  isolated: boolean;
  lastCheckedAt: string;
  notes: string;
}

export interface IcnDashboardData {
  nurseName: string;
  kpis: IcnKPI[];
  tasks: IcnTask[];
  activeAudit?: IcnAudit;
  patients: IcnPatientSurveillance[];
}
