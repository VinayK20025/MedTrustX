import type { StorekeeperDashboardData } from '../types/storekeeper.types';

export interface StoreFilters { status?: string; }

const mockData: StorekeeperDashboardData = {
  kpis: [
    { id: '1', label: 'Pending Receipts', value: 8, status: 'warning' },
    { id: '2', label: 'Items Issued Today', value: 312, status: 'success' },
    { id: '3', label: 'Expiry Alerts', value: 4, status: 'critical' },
    { id: '4', label: 'Bin Accuracy', value: '99%', status: 'normal' },
  ],
  incoming: [
    { id: 'INC-101', poNumber: 'PO-2024', item: 'N95 Respirators (Box)', quantity: 200, vendor: 'MedEquip Global', status: 'Pending Receipt', expectedDate: new Date(Date.now()).toISOString() },
    { id: 'INC-102', poNumber: 'PO-2025', item: 'Surgical Gowns', quantity: 500, vendor: 'CleanSolutions Inc.', status: 'Discrepancy', expectedDate: new Date(Date.now() - 86400000).toISOString() },
  ],
  requests: [
    { id: 'REQ-442', department: 'ICU', item: 'Latex Gloves (M)', requestedQty: 100, priority: 'Urgent', status: 'Pending', requestedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'REQ-443', department: 'Emergency', item: 'IV Sets', requestedQty: 50, priority: 'Routine', status: 'Picking', requestedAt: new Date(Date.now() - 7200000).toISOString() },
  ],
  inventory: [
    { id: 'INV-1', name: 'Latex Gloves (M)', quantity: 450, locationBin: 'A1-Row2-Bin4', status: 'Low' },
    { id: 'INV-2', name: 'IV Sets', quantity: 1200, locationBin: 'B3-Row1-Bin1', status: 'Optimal' },
  ],
  expiries: [
    { id: 'EXP-1', item: 'Adrenaline Vials', batch: 'ADR-9921', expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'Urgent' },
  ]
};

export const storekeeperApi = {
  getDashboardSummary: async (f: StoreFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  receiveStock: async (id: string, scannedQty: number) => ({ data: { success: true }, message: 'Stock received and binned', status: 200 }),
  issueStock: async (id: string) => ({ data: { success: true }, message: 'Stock issued to department', status: 200 }),
};
