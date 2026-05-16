/**
 * MedTrustX — Supply Chain Coordinator (Role 117) Types
 * Cross-functional flow controller connecting procurement, inventory, vendors, and departments.
 */

export interface SupplyChainKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface PipelineStage {
  id: string;
  name: 'Request' | 'Approval' | 'PO' | 'Vendor' | 'Delivery' | 'Inventory';
  status: 'Active' | 'Delayed' | 'Complete';
  count: number;
}

export interface TrackedOrder {
  id: string;
  item: string;
  vendor: string;
  stage: 'Request' | 'Approval' | 'PO' | 'Vendor' | 'Delivery' | 'Inventory';
  eta: string;
  status: 'On Track' | 'Delayed' | 'Critical Shortage';
}

export interface SupplyIssue {
  id: string;
  type: 'Delay' | 'Shortage' | 'Vendor Discrepancy';
  item: string;
  impact: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Escalated' | 'Resolved';
  reportedAt: string;
}

export interface VendorPerformance {
  id: string;
  name: string;
  onTimeRate: number; // percentage
  rating: number; // 0-5
  activeOrders: number;
}

export interface SupplyChainData {
  kpis: SupplyChainKPI[];
  pipeline: PipelineStage[];
  orders: TrackedOrder[];
  issues: SupplyIssue[];
  vendors: VendorPerformance[];
}
