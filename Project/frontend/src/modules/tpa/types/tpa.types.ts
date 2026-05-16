/**
 * MedTrustX — TPA Coordinator (Role 82) Types
 */

export interface TpaKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type TpaPipelineStage = 'Request' | 'Submitted' | 'Under Review' | 'Approved' | 'Additional Info' | 'Rejected' | 'Final Approval';

export interface TpaCase {
  id: string;
  patientName: string;
  mrn: string;
  insurer: string;
  tpaName?: string;
  policyNumber: string;
  estimatedCost: number;
  approvedAmount?: number;
  stage: TpaPipelineStage;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  type: 'Pre-Auth' | 'Enhancement' | 'Discharge';
  submittedAt: string;
  agingHours: number;
  dischargeBlocked: boolean;
  rejectionReason?: string;
}

export interface TpaDocument {
  id: string;
  name: string;
  type: 'ID Proof' | 'Policy Copy' | 'Doctor Note' | 'Lab Report' | 'Estimate' | 'Discharge Summary';
  status: 'Missing' | 'Uploaded' | 'Verified';
  uploadedAt?: string;
}

export interface TpaCommunication {
  id: string;
  type: 'Email' | 'Call' | 'Portal' | 'Note';
  direction: 'Inbound' | 'Outbound' | 'Internal';
  summary: string;
  timestamp: string;
  user: string;
}

export interface TpaDashboardData {
  kpis: TpaKPI[];
  cases: TpaCase[];
  documents: Record<string, TpaDocument[]>; // Keyed by caseId
  logs: Record<string, TpaCommunication[]>; // Keyed by caseId
}
