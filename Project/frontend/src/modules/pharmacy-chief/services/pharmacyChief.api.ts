import type {
  PharmacyChiefDashboardData, PharmacyKPI, DrugInventoryItem,
  PurchaseOrder, AdverseDrugEvent, DrugUsageMetric, PharmacyAlert
} from '../types/pharmacyChief.types';

export interface PharmacyFilters {
  category?: string;
}

const mockKpis: PharmacyKPI[] = [
  { id: '1', title: 'Total Inventory Value', value: 1250000, format: 'currency', status: 'normal', trend: 2.5, trendDirection: 'up' },
  { id: '2', title: 'Low Stock Items', value: 14, format: 'number', status: 'warning', actionLabel: 'View Inventory', actionUrl: '/dashboard/pharmacy-chief/inventory' },
  { id: '3', title: 'Pending PO Approvals', value: 3, format: 'number', status: 'normal', actionLabel: 'Review POs', actionUrl: '/dashboard/pharmacy-chief/procurement' },
  { id: '4', title: 'Adverse Drug Events (ADE)', value: 1, format: 'number', status: 'critical', actionLabel: 'Review Safety', actionUrl: '/dashboard/pharmacy-chief/safety' },
];

const mockInventory: DrugInventoryItem[] = [
  { id: 'DRG-001', drugCode: 'NDC-552', drugName: 'Meropenem 1g Injection', category: 'Antibiotic', currentStock: 45, minimumThreshold: 100, unit: 'Vials', status: 'Low Stock', expiryDate: '2027-01-15', batchNumber: 'MER-8821' },
  { id: 'DRG-002', drugCode: 'NDC-991', drugName: 'Fentanyl Citrate 50mcg/ml', category: 'Narcotic', currentStock: 250, minimumThreshold: 100, unit: 'Ampoules', status: 'In Stock', expiryDate: '2026-11-01', batchNumber: 'FEN-3392' },
  { id: 'DRG-003', drugCode: 'NDC-114', drugName: 'Propofol 1%', category: 'Anesthetic', currentStock: 12, minimumThreshold: 50, unit: 'Vials', status: 'Out of Stock', expiryDate: '2026-08-20', batchNumber: 'PRO-114A' },
];

const mockOrders: PurchaseOrder[] = [
  { id: 'PO-2026-04-110', vendorName: 'PharmaCorp Global', orderDate: new Date(Date.now() - 172800000).toISOString(), totalAmount: 45000.00, status: 'Pending Approval', itemsCount: 14, expectedDelivery: new Date(Date.now() + 604800000).toISOString() },
  { id: 'PO-2026-04-099', vendorName: 'MediSupply Direct', orderDate: new Date(Date.now() - 432000000).toISOString(), totalAmount: 12500.50, status: 'Shipped', itemsCount: 5, expectedDelivery: new Date(Date.now() + 86400000).toISOString() },
];

const mockEvents: AdverseDrugEvent[] = [
  { id: 'ADE-8812', patientId: 'MRN-7731', drugName: 'Vancomycin', reactionType: 'Allergic', severity: 'Severe', reportedBy: 'Dr. Sarah Jenkins', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'Investigating' },
];

const mockUsage: DrugUsageMetric[] = [
  { department: 'ICU', drugName: 'Norepinephrine', quantityConsumed: 450, costIncurred: 18000, trendPercentage: 15 },
  { department: 'Surgery', drugName: 'Propofol 1%', quantityConsumed: 320, costIncurred: 6400, trendPercentage: 5 },
  { department: 'Emergency', drugName: 'Ceftriaxone', quantityConsumed: 800, costIncurred: 4000, trendPercentage: -2 },
];

const mockAlerts: PharmacyAlert[] = [
  { id: 'ALT-PH-1', type: 'Narcotic Discrepancy', severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Active', message: 'Fentanyl vault count mismatch in ICU Pyxis machine. Audit required.' },
  { id: 'ALT-PH-2', type: 'Low Stock', severity: 'warning', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Active', message: 'Propofol 1% inventory critically low. Recommend emergency PO.' },
];

export const pharmacyChiefApi = {
  getDashboardSummary: async (filters: PharmacyFilters) => ({
    data: {
      kpis: mockKpis,
      inventory: mockInventory,
      purchaseOrders: mockOrders,
      adverseEvents: mockEvents,
      usageMetrics: mockUsage,
      alerts: mockAlerts,
    } as PharmacyChiefDashboardData,
    message: 'Success', status: 200,
  }),

  approvePurchaseOrder: async (orderId: string) => ({ data: { success: true }, message: `Purchase Order Approved`, status: 200 }),
  updateEventStatus: async (eventId: string, status: AdverseDrugEvent['status']) => ({ data: { success: true }, message: `ADE status updated to ${status}`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
