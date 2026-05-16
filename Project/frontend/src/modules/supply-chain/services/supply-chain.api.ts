import type { SupplyChainData } from '../types/supply-chain.types';

export interface ScFilters { status?: string; stage?: string; }

const mockData: SupplyChainData = {
  kpis: [
    { id: '1', label: 'Active Orders', value: 85, status: 'normal' },
    { id: '2', label: 'Delayed Shipments', value: 4, status: 'warning' },
    { id: '3', label: 'On-Time Delivery', value: '92%', status: 'success' },
    { id: '4', label: 'Critical Bottlenecks', value: 2, status: 'critical' },
  ],
  pipeline: [
    { id: 'S1', name: 'Request', status: 'Active', count: 12 },
    { id: 'S2', name: 'Approval', status: 'Active', count: 8 },
    { id: 'S3', name: 'PO', status: 'Active', count: 15 },
    { id: 'S4', name: 'Vendor', status: 'Delayed', count: 4 },
    { id: 'S5', name: 'Delivery', status: 'Active', count: 25 },
    { id: 'S6', name: 'Inventory', status: 'Active', count: 21 },
  ],
  orders: [
    { id: 'ORD-1001', item: 'Oxygen Cylinders (Type B)', vendor: 'AirGas Med', stage: 'Vendor', eta: new Date(Date.now() - 86400000).toISOString(), status: 'Delayed' },
    { id: 'ORD-1002', item: 'Propofol 10mg/ml', vendor: 'PharmaPlus', stage: 'Delivery', eta: new Date(Date.now() + 86400000).toISOString(), status: 'On Track' },
    { id: 'ORD-1003', item: 'N95 Respirators', vendor: 'MedEquip', stage: 'Approval', eta: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'Critical Shortage' },
  ],
  issues: [
    { id: 'ISS-01', type: 'Delay', item: 'Oxygen Cylinders', impact: 'High', status: 'Open', reportedAt: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 'ISS-02', type: 'Shortage', item: 'N95 Respirators', impact: 'High', status: 'Escalated', reportedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'ISS-03', type: 'Vendor Discrepancy', item: 'Surgical Gowns', impact: 'Low', status: 'Resolved', reportedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  ],
  vendors: [
    { id: 'V-101', name: 'AirGas Med', onTimeRate: 85, rating: 3.5, activeOrders: 2 },
    { id: 'V-102', name: 'PharmaPlus', onTimeRate: 98, rating: 4.9, activeOrders: 5 },
    { id: 'V-103', name: 'MedEquip', onTimeRate: 92, rating: 4.2, activeOrders: 8 },
  ]
};

export const supplyChainApi = {
  getDashboardSummary: async (f: ScFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  escalateIssue: async (issueId: string) => ({ data: { success: true }, message: 'Issue escalated to management', status: 200 }),
  contactVendor: async (vendorId: string) => ({ data: { success: true }, message: 'Automated follow-up sent to vendor', status: 200 }),
};
