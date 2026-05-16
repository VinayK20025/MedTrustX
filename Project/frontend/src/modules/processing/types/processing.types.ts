/**
 * MedTrustX — Processing Officer (Role 84) Types
 */

export interface ProcessingKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type ProcessingTaskType = 'Billing Entry' | 'Claim Verification' | 'Document Check' | 'Data Update';
export type TaskPriority = 'Routine' | 'High' | 'Critical';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Blocked';

export interface ValidationIssue {
  id: string;
  field: string;
  issue: string;
  severity: 'Warning' | 'Error';
}

export interface ProcessingTask {
  id: string;
  referenceId: string; // E.g., Bill #, Claim #, MRN
  type: ProcessingTaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedAt: string;
  patientName: string;
  formData: Record<string, string | number | boolean>;
  validationIssues: ValidationIssue[];
  requiredDocuments: { name: string; status: 'Uploaded' | 'Missing' }[];
}

export interface ProcessingLog {
  id: string;
  taskId: string;
  action: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface ProcessingDashboardData {
  kpis: ProcessingKPI[];
  tasks: ProcessingTask[];
  logs: ProcessingLog[];
}
