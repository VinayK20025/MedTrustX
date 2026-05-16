import type { ProcurementExecData } from '../types/procurement-exec.types';

export interface ExecFilters { priority?: string; status?: string; }

const mockData: ProcurementExecData = {
  kpis: [
    { id: '1', label: 'Pending PO Creations', value: 8, status: 'warning' },
    { id: '2', label: 'Orders Processed Today', value: 45, status: 'success' },
    { id: '3', label: 'Delayed Deliveries', value: 3, status: 'critical' },
    { id: '4', label: 'Avg Processing Time', value: '4.2m', status: 'normal' },
  ],
  pendingRequests: [
    { id: 'PR-998', item: 'Latex Surgical Gloves (Box of 100)', department: 'ICU', quantity: 150, priority: 'Critical', status: 'Approved', approvedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'PR-999', item: 'IV Cannula 20G', department: 'Emergency', quantity: 500, priority: 'High', status: 'Approved', approvedAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'PR-1000', item: 'A4 Printing Paper (Ream)', department: 'Billing', quantity: 20, priority: 'Normal', status: 'Processing', approvedAt: new Date(Date.now() - 86400000).toISOString() },
  ],
  activeDeliveries: [
    { id: 'PO-3011', requestId: 'PR-901', item: 'N95 Respirator Masks', vendor: 'MedEquip Global', quantity: 200, totalCost: 1500, status: 'Delayed', eta: new Date(Date.now() - 43200000).toISOString() },
    { id: 'PO-3012', requestId: 'PR-902', item: 'Propofol 10mg/ml', vendor: 'PharmaPlus Dist.', quantity: 50, totalCost: 850, status: 'In Transit', eta: new Date(Date.now() + 86400000 * 1).toISOString() },
  ],
  vendors: [
    { id: 'V-101', name: 'MedEquip Global', contactPerson: 'John Smith', phone: '+1-555-0192', email: 'orders@medequip.com', category: 'Medical Supplies' },
    { id: 'V-102', name: 'PharmaPlus Dist.', contactPerson: 'Sarah Jenkins', phone: '+1-555-0193', email: 'dispatch@pharmaplus.com', category: 'Pharmacy' },
  ],
};

export const procurementExecApi = {
  getDashboardSummary: async (f: ExecFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  createPurchaseOrder: async (requestId: string, payload: any) => ({ data: { success: true, poId: 'PO-' + Math.floor(Math.random() * 10000) }, message: 'Purchase Order generated', status: 200 }),
  updateDeliveryStatus: async (poId: string, status: string) => ({ data: { success: true }, message: 'Delivery status updated', status: 200 }),
};
