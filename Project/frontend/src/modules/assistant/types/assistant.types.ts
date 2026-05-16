/**
 * MedTrustX — Nursing Assistant Types
 * Simple, instructional tasks (hygiene, feeding, mobility)
 */

export interface AssistantKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export type AssistantTaskType = 'hygiene' | 'feeding' | 'mobility' | 'general';

export interface AssistantTask {
  id: string;
  type: AssistantTaskType;
  title: string;
  patientName: string;
  bed: string;
  timeScheduled: string;
  status: 'pending' | 'in_progress' | 'completed';
  instructions: string[];
}

export interface AssistantPatient {
  id: string;
  name: string;
  bed: string;
  requiresAssistance: boolean;
  notes: string;
}

export interface AssistantAlert {
  id: string;
  type: 'nurse_call' | 'task_overdue' | 'patient_need';
  message: string;
  severity: 'critical' | 'high' | 'medium';
  timestamp: string;
}

export interface AssistantDashboardData {
  kpis: AssistantKPI[];
  tasks: AssistantTask[];
  patients: AssistantPatient[];
  alerts: AssistantAlert[];
}
