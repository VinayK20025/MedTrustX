/**
 * MedTrustX — Laundry Staff (Role 123) Types
 * Linen processing, infection control segregation, and bulk tracking.
 */

export interface LaundryKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface LinenTask {
  id: string;
  department: string;
  type: 'Collection' | 'Processing' | 'Distribution';
  category: 'Normal' | 'Soiled' | 'Infectious';
  quantity: number;
  unit: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  timeLog: string;
}

export interface ProcessingBatch {
  id: string;
  batchType: 'Normal' | 'Soiled' | 'Infectious';
  weight: string;
  stage: 'Wash' | 'Disinfect' | 'Dry' | 'Fold';
  progress: number; // 0-100
}

export interface LaundryData {
  kpis: LaundryKPI[];
  tasks: LinenTask[];
  activeBatches: ProcessingBatch[];
}
