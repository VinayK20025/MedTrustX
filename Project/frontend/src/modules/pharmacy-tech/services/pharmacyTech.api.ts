import type {
  PharmacyTechDashboardData, PharmacyTechKPI, PharmacyTaskQueueItem,
  PreparationTask, TechInventoryItem, TechAlert
} from '../types/pharmacyTech.types';

export interface PharmacyTechFilters {
  status?: string;
  type?: string;
}

const mockKpis: PharmacyTechKPI[] = [
  { id: '1', title: 'Pending Picks', value: 24, format: 'number', status: 'warning', actionLabel: 'View Queue', actionUrl: '/dashboard/pharmacy-tech/tasks' },
  { id: '2', title: 'Picks Completed', value: 156, format: 'number', status: 'success' },
  { id: '3', title: 'Low Stock Items', value: 8, format: 'number', status: 'critical', actionLabel: 'View Inventory', actionUrl: '/dashboard/pharmacy-tech/inventory' },
  { id: '4', title: 'STAT Delays', value: 0, format: 'number', status: 'normal' },
];

const mockTasks: PharmacyTaskQueueItem[] = [
  { id: 'TSK-1', prescriptionId: 'RX-88219', taskType: 'Pick & Pack', priority: 'Routine', status: 'In Progress', timeAssigned: new Date(Date.now() - 600000).toISOString() },
  { id: 'TSK-2', prescriptionId: 'RX-88220', taskType: 'Pick & Pack', priority: 'STAT', status: 'Pending', timeAssigned: new Date(Date.now() - 120000).toISOString() },
  { id: 'TSK-3', prescriptionId: 'RX-88221', taskType: 'Compounding', priority: 'Urgent', status: 'Pending', timeAssigned: new Date(Date.now() - 1800000).toISOString() },
];

const mockPreparation: PreparationTask = {
  id: 'TSK-1',
  prescriptionId: 'RX-88219',
  patientType: 'OPD',
  itemsToPick: [
    { id: 'D-1', drugName: 'Amoxicillin 500mg Cap', ndc: 'NDC-112', location: 'Aisle 2, Bin 4', quantityRequired: 21, picked: true, scanned: true },
    { id: 'D-2', drugName: 'Ibuprofen 400mg Tab', ndc: 'NDC-441', location: 'Aisle 1, Bin 12', quantityRequired: 30, picked: false, scanned: false },
  ],
  labelPrinted: false,
};

const mockInventory: TechInventoryItem[] = [
  { id: 'INV-1', drugCode: 'NDC-112', drugName: 'Amoxicillin 500mg Cap', location: 'Aisle 2, Bin 4', currentStock: 500, status: 'In Stock', reorderThreshold: 100 },
  { id: 'INV-2', drugCode: 'NDC-441', drugName: 'Ibuprofen 400mg Tab', location: 'Aisle 1, Bin 12', currentStock: 1200, status: 'In Stock', reorderThreshold: 200 },
];

const mockAlerts: TechAlert[] = [
  { id: 'ALT-TECH-1', type: 'Stock Low', severity: 'warning', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Active', message: 'Ceftriaxone 1g Vials dropping below reorder threshold (Current: 14, Min: 50).' },
];

export const pharmacyTechApi = {
  getDashboardSummary: async (filters: PharmacyTechFilters) => ({
    data: {
      kpis: mockKpis,
      tasks: mockTasks,
      activePreparation: mockPreparation,
      inventorySearch: mockInventory,
      alerts: mockAlerts,
    } as PharmacyTechDashboardData,
    message: 'Success', status: 200,
  }),

  scanPickBarcode: async (taskId: string, itemId: string, barcode: string) => ({ data: { success: true }, message: `Item scanned and verified`, status: 200 }),
  printLabel: async (taskId: string) => ({ data: { success: true }, message: `Prescription label printed`, status: 200 }),
  handoverToPharmacist: async (taskId: string) => ({ data: { success: true }, message: `Task handed over to Pharmacist for validation`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
