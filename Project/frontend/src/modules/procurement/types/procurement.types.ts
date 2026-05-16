/**
 * MedTrustX — Procurement Manager (Role 112) Types
 * Strategic supply-chain, vendor management, and purchase order workflow.
 */

export interface ProcurementKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface PurchaseRequest {
  id: string;
  item: string;
  category: 'Medical' | 'Surgical' | 'Pharmacy' | 'Facility' | 'IT';
  department: string;
  quantity: number;
  priority: 'Critical' | 'High' | 'Normal';
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'PO Created';
  requestedAt: string;
}

export interface PurchaseOrder {
  id: string;
  requestId?: string;
  item: string;
  vendor: string;
  quantity: number;
  totalCost: number;
  status: 'Draft' | 'Sent' | 'In Transit' | 'Delivered';
  eta?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number; // 0-5
  status: 'Active' | 'Under Review' | 'Blacklisted';
  avgDeliveryDays: number;
}

export interface InventoryAlert {
  id: string;
  item: string;
  department: string;
  currentStock: number;
  minimumLevel: number;
  status: 'Critical' | 'Low';
}

export interface BudgetStatus {
  id: string;
  category: string;
  allocated: number;
  utilized: number;
}

export interface ProcurementDashboardData {
  kpis: ProcurementKPI[];
  requests: PurchaseRequest[];
  orders: PurchaseOrder[];
  vendors: Vendor[];
  inventoryAlerts: InventoryAlert[];
  budgets: BudgetStatus[];
}
