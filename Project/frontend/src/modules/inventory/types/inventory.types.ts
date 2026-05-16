/**
 * MedTrustX — Inventory Manager (Role 114) Types
 * Real-time stock control, expiry tracking, and replenishment.
 */

export interface InventoryKPI {
  id: string;
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Pharmacy' | 'Consumables' | 'Equipment' | 'Surgical' | 'General';
  currentStock: number;
  minimumStock: number;
  unit: string;
  location: string;
  status: 'Optimal' | 'Low' | 'Critical' | 'Overstock';
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'Inbound' | 'Outbound' | 'Adjustment';
  quantity: number;
  department?: string;
  date: string;
}

export interface ExpiryItem {
  id: string;
  itemId: string;
  itemName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  status: 'Safe' | 'Expiring Soon' | 'Expired';
}

export interface ReorderAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  suggestedOrder: number;
  status: 'Pending' | 'PR Generated';
}

export interface InventoryDashboardData {
  kpis: InventoryKPI[];
  items: InventoryItem[];
  movements: StockMovement[];
  expiryItems: ExpiryItem[];
  reorders: ReorderAlert[];
}
