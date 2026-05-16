/**
 * MedTrustX — Storekeeper (Role 115) Types
 * Ground-level inventory execution, receiving, issuing, and mobile barcode scanning.
 */

export interface StoreKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface IncomingStock {
  id: string;
  poNumber: string;
  item: string;
  quantity: number;
  vendor: string;
  status: 'Pending Receipt' | 'Verified' | 'Discrepancy';
  expectedDate: string;
}

export interface IssueRequest {
  id: string;
  department: string;
  item: string;
  requestedQty: number;
  priority: 'Routine' | 'Urgent';
  status: 'Pending' | 'Picking' | 'Issued';
  requestedAt: string;
}

export interface StoreInventoryItem {
  id: string;
  name: string;
  quantity: number;
  locationBin: string; // e.g., "A1-Shelf-3"
  status: 'Optimal' | 'Low';
}

export interface ExpiryAlert {
  id: string;
  item: string;
  batch: string;
  expiryDate: string;
  status: 'Urgent' | 'Warning';
}

export interface StorekeeperDashboardData {
  kpis: StoreKPI[];
  incoming: IncomingStock[];
  requests: IssueRequest[];
  inventory: StoreInventoryItem[];
  expiries: ExpiryAlert[];
}
