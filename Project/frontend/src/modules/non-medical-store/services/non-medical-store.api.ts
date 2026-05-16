import type { NonMedicalStoreData } from '../types/non-medical-store.types';

export interface NmFilters { status?: string; category?: string; }

const mockData: NonMedicalStoreData = {
  kpis: [
    { id: '1', label: 'Pending Deliveries', value: 3, status: 'warning' },
    { id: '2', label: 'Bulk Items Issued Today', value: '1,240', status: 'success' },
    { id: '3', label: 'Low Stock Alerts', value: 5, status: 'critical' },
    { id: '4', label: 'Housekeeping Stock', value: 'Optimal', status: 'normal' },
  ],
  incoming: [
    { id: 'INC-201', poNumber: 'PO-9912', item: 'Hospital Grade Disinfectant', quantity: 50, unit: 'Gallons', vendor: 'CleanCorp', status: 'Pending Receipt', expectedDate: new Date(Date.now()).toISOString() },
    { id: 'INC-202', poNumber: 'PO-9913', item: 'Printer Paper (A4)', quantity: 100, unit: 'Reams', vendor: 'OfficeMax', status: 'Discrepancy', expectedDate: new Date(Date.now() - 86400000).toISOString() },
  ],
  requests: [
    { id: 'REQ-881', department: 'Ward B (Housekeeping)', category: 'Housekeeping', items: [ { name: 'Floor Cleaner', requestedQty: 10, unit: 'Bottles' }, { name: 'Garbage Bags (XL)', requestedQty: 500, unit: 'Pieces' } ], status: 'Pending', requestedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'REQ-882', department: 'Admin Office', category: 'Admin', items: [ { name: 'Printer Toner', requestedQty: 2, unit: 'Cartridges' } ], status: 'Picking', requestedAt: new Date(Date.now() - 7200000).toISOString() },
  ],
  inventory: [
    { id: 'INV-10', name: 'Floor Cleaner (Lavender)', category: 'Housekeeping', quantity: 120, unit: 'Bottles', locationBin: 'Zone-H1-Rack2', status: 'Optimal' },
    { id: 'INV-11', name: 'Garbage Bags (XL)', category: 'Housekeeping', quantity: 5000, unit: 'Pieces', locationBin: 'Zone-H2-Bulk', status: 'Low' },
    { id: 'INV-12', name: 'LED Bulbs (15W)', category: 'Maintenance', quantity: 45, unit: 'Pieces', locationBin: 'Zone-M1-Rack1', status: 'Optimal' },
  ],
  consumption: [
    { id: 'CON-1', item: 'Floor Cleaner (Lavender)', department: 'Ward B', quantityUsed: 25, date: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: 'CON-2', item: 'Printer Paper (A4)', department: 'Admin Office', quantityUsed: 15, date: new Date(Date.now() - 86400000 * 3).toISOString() },
  ]
};

export const nonMedicalStoreApi = {
  getDashboardSummary: async (f: NmFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  receiveBulkStock: async (id: string, qty: number) => ({ data: { success: true }, message: 'Bulk stock received', status: 200 }),
  issueBulkStock: async (id: string) => ({ data: { success: true }, message: 'Items issued to department', status: 200 }),
};
