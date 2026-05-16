/**
 * MedTrustX — Deputy Medical Superintendent Module Types
 * Real-time Execution & Floor Operations domain models
 */

export interface DeputyKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'neutral';
  delta?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface FlowQueueItem {
  id: string;
  type: 'admission' | 'discharge' | 'er_triage';
  patientName: string;
  age: number;
  department: string;
  ward?: string;
  bed?: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'waiting' | 'processing' | 'delayed' | 'completed';
  waitTime: number; // minutes
  delayReason?: string;
  assignedTo?: string;
}

export interface BedAllocation {
  id: string;
  ward: string;
  bedNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  patientName?: string;
  department?: string;
}

export interface WardSnapshot {
  id: string;
  name: string;
  totalBeds: number;
  occupied: number;
  available: number;
  pendingDischarges: number;
  criticalCount: number;
  status: 'normal' | 'high' | 'full';
}

export interface ActiveIssue {
  id: string;
  title: string;
  type: 'complaint' | 'incident' | 'escalation' | 'delay';
  severity: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved';
  reportedAt: string;
  assignedTo?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo: string;
  department: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface DeputyMSDashboardData {
  kpis: DeputyKPI[];
  flowQueue: FlowQueueItem[];
  wards: WardSnapshot[];
  issues: ActiveIssue[];
  tasks: TaskItem[];
}
