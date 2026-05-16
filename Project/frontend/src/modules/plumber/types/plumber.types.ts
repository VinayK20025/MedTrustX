/**
 * MedTrustX — Plumber (Role 89) Types
 */

export interface PlumberKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type PlumTaskPriority = 'Routine' | 'Medium' | 'Critical';
export type PlumTaskStatus = 'Assigned' | 'In Progress' | 'Resolved' | 'Verified';

export interface PlumbingTask {
  id: string;
  title: string;
  description: string;
  location: string;
  system: string; // e.g., 'Water Supply', 'Drainage', 'Gas Line'
  priority: PlumTaskPriority;
  status: PlumTaskStatus;
  assignedAt: string;
  isEmergency: boolean;
  hygieneChecklistCompleted: boolean;
}

export interface PlumbingSystem {
  id: string;
  name: string;
  type: 'Water' | 'Drainage' | 'Medical Gas';
  status: 'OK' | 'Warning' | 'Fault';
  pressureReading?: string;
  location: string;
}

export interface PlumberDashboardData {
  kpis: PlumberKPI[];
  tasks: PlumbingTask[];
  systems: PlumbingSystem[];
}
