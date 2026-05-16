/**
 * MedTrustX — Procurement Officer (Role 113) Types
 * Fast PO execution, delivery tracking, and vendor coordination.
 */

export interface ProcExecKPI {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface ExecPurchaseRequest {
  id: string;
  item: string;
  department: string;
  quantity: number;
  priority: 'Critical' | 'High' | 'Normal';
  status: 'Approved' | 'PO Created' | 'Processing';
  approvedAt: string;
}

export interface ExecPurchaseOrder {
  id: string;
  requestId: string;
  item: string;
  vendor: string;
  quantity: number;
  totalCost: number;
  status: 'Sent' | 'In Transit' | 'Delayed' | 'Delivered';
  eta: string;
}

export interface VendorContact {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
}

export interface ProcurementExecData {
  kpis: ProcExecKPI[];
  pendingRequests: ExecPurchaseRequest[];
  activeDeliveries: ExecPurchaseOrder[];
  vendors: VendorContact[];
}
