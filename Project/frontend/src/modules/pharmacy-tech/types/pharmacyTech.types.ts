/**
 * MedTrustX — Pharmacy Technician Types
 */

export interface PharmacyTechKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface PharmacyTaskQueueItem {
  id: string;
  prescriptionId: string;
  taskType: 'Pick & Pack' | 'Compounding' | 'Restock';
  priority: 'Routine' | 'STAT' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Ready for Handover' | 'Completed';
  timeAssigned: string;
  location?: string;
}

export interface PreparationTask {
  id: string;
  prescriptionId: string;
  patientType: 'IPD' | 'OPD';
  itemsToPick: {
    id: string;
    drugName: string;
    ndc: string;
    location: string;
    quantityRequired: number;
    picked: boolean;
    scanned: boolean;
  }[];
  labelPrinted: boolean;
}

export interface TechInventoryItem {
  id: string;
  drugCode: string;
  drugName: string;
  location: string; // Aisle, Shelf, Bin
  currentStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  reorderThreshold: number;
}

export interface TechAlert {
  id: string;
  type: 'Stock Low' | 'Barcode Mismatch' | 'STAT Order Delayed';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface PharmacyTechDashboardData {
  kpis: PharmacyTechKPI[];
  tasks: PharmacyTaskQueueItem[];
  activePreparation?: PreparationTask;
  inventorySearch: TechInventoryItem[];
  alerts: TechAlert[];
}
