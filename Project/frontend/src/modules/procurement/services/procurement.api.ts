import type { ProcurementDashboardData } from '../types/procurement.types';

export interface ProcFilters { category?: string; status?: string; }

const mockData: ProcurementDashboardData = {
  kpis: [
    { id: '1', label: 'Pending Approvals', value: 12, status: 'warning' },
    { id: '2', label: 'Active POs', value: 45, status: 'success' },
    { id: '3', label: 'Budget Utilized', value: '72%', status: 'normal' },
    { id: '4', label: 'Critical Shortages', value: 2, status: 'critical' },
  ],
  requests: [
    { id: 'PR-901', item: 'N95 Respirator Masks (Box of 50)', category: 'Medical', department: 'ICU', quantity: 200, priority: 'Critical', status: 'Pending Review', requestedAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'PR-902', item: 'Propofol 10mg/ml 50ml vial', category: 'Pharmacy', department: 'Operation Theatre', quantity: 50, priority: 'High', status: 'Pending Review', requestedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'PR-903', item: 'Printer Toner Cartridges', category: 'IT', department: 'Admin', quantity: 15, priority: 'Normal', status: 'Approved', requestedAt: new Date(Date.now() - 172800000).toISOString() },
  ],
  orders: [
    { id: 'PO-2023', requestId: 'PR-903', item: 'Printer Toner Cartridges', vendor: 'OfficeMax Supply', quantity: 15, totalCost: 1250.00, status: 'In Transit', eta: new Date(Date.now() + 86400000 * 2).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'PO-2024', item: 'Liquid Oxygen (Bulk)', vendor: 'AirGas Med', quantity: 5000, totalCost: 18500.00, status: 'Sent', eta: new Date(Date.now() + 86400000 * 1).toISOString(), createdAt: new Date(Date.now() - 43200000).toISOString() },
  ],
  vendors: [
    { id: 'V-101', name: 'MedEquip Global', category: 'Medical Supplies', rating: 4.8, status: 'Active', avgDeliveryDays: 2 },
    { id: 'V-102', name: 'PharmaPlus Dist.', category: 'Pharmacy', rating: 4.2, status: 'Active', avgDeliveryDays: 1 },
    { id: 'V-103', name: 'CleanSolutions Inc.', category: 'Facility', rating: 2.5, status: 'Under Review', avgDeliveryDays: 5 },
  ],
  inventoryAlerts: [
    { id: 'AL-1', item: 'Oxygen Cylinders (Type B)', department: 'ER', currentStock: 4, minimumLevel: 15, status: 'Critical' },
    { id: 'AL-2', item: 'Fentanyl 50mcg/ml', department: 'ICU', currentStock: 12, minimumLevel: 20, status: 'Low' },
  ],
  budgets: [
    { id: 'B-MED', category: 'Medical & Surgical', allocated: 1500000, utilized: 1100000 },
    { id: 'B-PHA', category: 'Pharmacy', allocated: 2000000, utilized: 1650000 },
    { id: 'B-FAC', category: 'Facility & Operations', allocated: 500000, utilized: 420000 },
  ],
};

export const procurementApi = {
  getDashboardSummary: async (f: ProcFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  approveRequest: async (requestId: string) => ({ data: { success: true }, message: 'Request approved', status: 200 }),
  rejectRequest: async (requestId: string, reason: string) => ({ data: { success: true }, message: 'Request rejected', status: 200 }),
  createPurchaseOrder: async (payload: any) => ({ data: { success: true, poId: 'PO-NEW' }, message: 'Purchase Order generated', status: 200 }),
};
