/**
 * MedTrustX — Maintenance Engineer (Role 87) Types
 */

export interface MaintenanceKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export type TaskPriority = 'Routine' | 'High' | 'Emergency';
export type TaskStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Blocked';

export interface MaintenanceTask {
  id: string;
  workOrderId: string;
  title: string;
  description: string;
  location: string;
  assetId: string;
  assetName: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedAt: string;
  notes?: string;
  isOfflineSyncPending?: boolean;
}

export interface EquipmentDetails {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'Operational' | 'Faulty' | 'Maintenance';
  lastServiceDate: string;
  manualUrl?: string;
}

export interface MaintenanceLog {
  id: string;
  taskId: string;
  action: string;
  timestamp: string;
}

export interface MaintenanceDashboardData {
  kpis: MaintenanceKPI[];
  tasks: MaintenanceTask[];
  equipment: Record<string, EquipmentDetails>; // Keyed by assetId
  logs: MaintenanceLog[];
}
