/**
 * MedTrustX — Biomedical Engineering Service Types
 */

export type EquipmentStatus = 'Operational' | 'In Use' | 'Maintenance' | 'Calibration Required' | 'Retired';
export type MaintenancePriority = 'Routine' | 'Urgent' | 'Emergency' | 'Critical';

export interface MedicalEquipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  department: string;
  status: EquipmentStatus;
  lastServiceDate: string;
  nextServiceDate: string;
}

export interface MaintenanceJob {
  id: string;
  equipmentId: string;
  equipmentName: string;
  jobType: 'Preventive' | 'Corrective' | 'Calibration';
  priority: MaintenancePriority;
  status: 'Open' | 'In Progress' | 'Awaiting Parts' | 'Completed';
  technicianName?: string;
  requestDate: string;
}

export interface InventoryItem {
  id: string;
  partName: string;
  partNumber: string;
  stockLevel: number;
  minStockLevel: number;
  unit: string;
}

export interface BiomedMetrics {
  totalEquipmentCount: number;
  operationalUptimePercent: number;
  pendingWorkOrdersCount: number;
  calibrationCompliancePercent: number;
  criticalEquipmentDownCount: number;
}

export interface BiomedDashboardData {
  metrics: BiomedMetrics;
  criticalEquipment: MedicalEquipment[];
  activeJobs: MaintenanceJob;
  lowStockParts: InventoryItem[];
}

// Fixed activeJobs to be an array in implementation
export interface BiomedDashboardDataFixed extends Omit<BiomedDashboardData, 'activeJobs'> {
  activeJobs: MaintenanceJob[];
}
