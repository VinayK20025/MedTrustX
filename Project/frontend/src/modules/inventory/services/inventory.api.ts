import type { InventoryDashboardData } from '../types/inventory.types';

export interface InvFilters { category?: string; status?: string; }

const mockData: InventoryDashboardData = {
  kpis: [
    { id: '1', label: 'Total Tracked Items', value: '4,285', status: 'normal' },
    { id: '2', label: 'Low Stock Alerts', value: 12, status: 'warning' },
    { id: '3', label: 'Expiring (<30 Days)', value: 8, status: 'critical' },
    { id: '4', label: 'Stock Accuracy', value: '99.2%', status: 'success' },
  ],
  items: [
    { id: 'INV-001', name: 'Latex Gloves (Medium)', category: 'Consumables', currentStock: 450, minimumStock: 500, unit: 'Boxes', location: 'Main Store A', status: 'Low' },
    { id: 'INV-002', name: 'Oxygen Cylinder (Type B)', category: 'Equipment', currentStock: 12, minimumStock: 20, unit: 'Cylinders', location: 'ER Depot', status: 'Critical' },
    { id: 'INV-003', name: 'Propofol 10mg/ml', category: 'Pharmacy', currentStock: 150, minimumStock: 50, unit: 'Vials', location: 'OT Pharmacy', status: 'Optimal' },
    { id: 'INV-004', name: 'IV Fluids (NS 500ml)', category: 'Pharmacy', currentStock: 2000, minimumStock: 1000, unit: 'Bags', location: 'Main Store B', status: 'Optimal' },
  ],
  movements: [
    { id: 'MOV-1', itemId: 'INV-001', type: 'Outbound', quantity: 20, department: 'ICU', date: new Date(Date.now() - 3600000).toISOString() },
    { id: 'MOV-2', itemId: 'INV-002', type: 'Inbound', quantity: 15, date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'MOV-3', itemId: 'INV-004', type: 'Outbound', quantity: 100, department: 'ER', date: new Date(Date.now() - 7200000).toISOString() },
  ],
  expiryItems: [
    { id: 'EXP-1', itemId: 'INV-003', itemName: 'Propofol 10mg/ml', batchNumber: 'B-88392', quantity: 20, expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'Expiring Soon' },
    { id: 'EXP-2', itemId: 'INV-888', itemName: 'Amoxicillin 500mg', batchNumber: 'AMX-091', quantity: 50, expiryDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Expired' },
  ],
  reorders: [
    { id: 'RO-1', itemId: 'INV-001', itemName: 'Latex Gloves (Medium)', currentStock: 450, suggestedOrder: 1000, status: 'Pending' },
    { id: 'RO-2', itemId: 'INV-002', itemName: 'Oxygen Cylinder (Type B)', currentStock: 12, suggestedOrder: 50, status: 'PR Generated' },
  ]
};

export const inventoryApi = {
  getDashboardSummary: async (f: InvFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  triggerReorder: async (itemId: string, qty: number) => ({ data: { success: true }, message: 'Purchase Request triggered', status: 200 }),
  discardExpired: async (expiryId: string) => ({ data: { success: true }, message: 'Stock marked as discarded/wasted', status: 200 }),
};
