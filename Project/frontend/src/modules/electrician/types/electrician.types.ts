/**
 * MedTrustX — Electrician (Role 88) Types
 */

export interface ElectricianKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type ElectTaskPriority = 'Routine' | 'Medium' | 'Critical';
export type ElectTaskStatus = 'Assigned' | 'In Progress' | 'Resolved' | 'Verified';

export interface ElectricalTask {
  id: string;
  title: string;
  description: string;
  location: string;
  system: string; // e.g., 'Panel A', 'Generator 2'
  priority: ElectTaskPriority;
  status: ElectTaskStatus;
  assignedAt: string;
  isEmergency: boolean;
  safetyChecklistCompleted: boolean;
}

export interface ElectricalSystem {
  id: string;
  name: string;
  type: 'Generator' | 'UPS' | 'Panel' | 'Circuit';
  status: 'OK' | 'Warning' | 'Fault';
  loadPercentage?: number;
  location: string;
}

export interface ElectricianDashboardData {
  kpis: ElectricianKPI[];
  tasks: ElectricalTask[];
  systems: ElectricalSystem[];
}
