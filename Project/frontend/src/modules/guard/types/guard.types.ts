/**
 * MedTrustX — Security Guard (Role 100) Types
 * Mobile-first field execution for physical security personnel.
 */

export type GuardTaskStatus = 'Pending' | 'In Progress' | 'Done' | 'Escalated';
export type GuardTaskPriority = 'Emergency' | 'High' | 'Normal';

export interface GuardTask {
  id: string;
  title: string;
  location: string;
  type: 'Patrol' | 'Incident Response' | 'Visitor Escort' | 'Access Check' | 'Emergency';
  priority: GuardTaskPriority;
  status: GuardTaskStatus;
  assignedAt: string;
  instructions: string;
  isEmergency: boolean;
}

export interface GuardKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface PatrolCheckpoint {
  id: string;
  name: string;
  location: string;
  checked: boolean;
  checkedAt?: string;
}

export interface GuardDashboardData {
  kpis: GuardKPI[];
  tasks: GuardTask[];
  todayPatrol: PatrolCheckpoint[];
  guardName: string;
  shiftEnd: string;
}
