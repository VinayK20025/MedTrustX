/**
 * MedTrustX — Biomedical Technician Types
 */

export interface BiomedTechKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface BiomedDevice {
  id: string;
  name: string;
  serialNumber: string;
  type: 'Ventilator' | 'Monitor' | 'Imaging' | 'Infusion Pump' | 'OT Equipment';
  department: string;
  location: string;
  status: 'Online' | 'Offline' | 'Fault' | 'Maintenance';
}

export interface MaintenanceChecklistStep {
  id: string;
  description: string;
  isCompleted: boolean;
  notes?: string;
}

export interface BiomedTask {
  id: string;
  deviceId: string;
  type: 'Preventive' | 'Repair' | 'Calibration Support';
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Assigned' | 'In Progress' | 'Completed';
  checklist: MaintenanceChecklistStep[];
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  taskId: string;
  deviceId: string;
  date: string;
  durationMinutes: number;
  summary: string;
  status: 'Successful' | 'Escalated';
}

export interface BiomedTechDashboardData {
  kpis: BiomedTechKPI[];
  tasks: BiomedTask[];
  activeTask?: BiomedTask;
  devices: BiomedDevice[];
  recentLogs: MaintenanceLog[];
}
