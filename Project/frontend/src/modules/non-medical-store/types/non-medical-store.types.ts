/**
 * MedTrustX — Storekeeper (Non-Medical) (Role 116) Types
 * Fast execution of bulk housekeeping, maintenance, and admin supplies.
 */

export interface NonMedicalKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface BulkIncomingStock {
  id: string;
  poNumber: string;
  item: string;
  quantity: number;
  unit: string; // e.g., "Pallets", "Reams", "Gallons"
  vendor: string;
  status: 'Pending Receipt' | 'Verified' | 'Discrepancy';
  expectedDate: string;
}

export interface BulkIssueRequest {
  id: string;
  department: string;
  category: 'Housekeeping' | 'Maintenance' | 'Admin';
  items: Array<{ name: string; requestedQty: number; unit: string }>;
  status: 'Pending' | 'Picking' | 'Issued';
  requestedAt: string;
}

export interface NonMedicalInventoryItem {
  id: string;
  name: string;
  category: 'Housekeeping' | 'Maintenance' | 'Admin';
  quantity: number;
  unit: string;
  locationBin: string;
  status: 'Optimal' | 'Low';
}

export interface ConsumptionLog {
  id: string;
  item: string;
  department: string;
  quantityUsed: number;
  date: string;
}

export interface NonMedicalStoreData {
  kpis: NonMedicalKPI[];
  incoming: BulkIncomingStock[];
  requests: BulkIssueRequest[];
  inventory: NonMedicalInventoryItem[];
  consumption: ConsumptionLog[];
}
