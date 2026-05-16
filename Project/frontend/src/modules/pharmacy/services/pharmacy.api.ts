import type {
  PharmacyDashboardData, PharmacyKPI, PrescriptionQueueItem,
  PrescriptionDetail, DispensingInventoryItem, DispensingAlert
} from '../types/pharmacy.types';

export interface DispensingFilters {
  status?: string;
  type?: string;
}

const mockKpis: PharmacyKPI[] = [
  { id: '1', title: 'Pending Prescriptions', value: 18, format: 'number', status: 'warning', actionLabel: 'View Queue', actionUrl: '/dashboard/pharmacy/prescriptions' },
  { id: '2', title: 'Processed Today', value: 142, format: 'number', status: 'success' },
  { id: '3', title: 'Safety Flags', value: 2, format: 'number', status: 'critical', actionLabel: 'Review Alerts', actionUrl: '/dashboard/pharmacy/alerts' },
  { id: '4', title: 'Daily Dispense Value', value: 45200, format: 'currency', status: 'normal' },
];

const mockQueue: PrescriptionQueueItem[] = [
  { id: 'RX-Q-1', prescriptionId: 'RX-88219', patientName: 'John Doe', mrn: 'MRN-1100', type: 'OPD', status: 'Ready to Dispense', priority: 'Routine', timeReceived: new Date(Date.now() - 900000).toISOString() },
  { id: 'RX-Q-2', prescriptionId: 'RX-88220', patientName: 'Jane Smith', mrn: 'MRN-2234', type: 'Discharge', status: 'Pending', priority: 'STAT', timeReceived: new Date(Date.now() - 300000).toISOString() },
  { id: 'RX-Q-3', prescriptionId: 'RX-88221', patientName: 'Robert Johnson', mrn: 'MRN-5541', type: 'IPD', status: 'Verifying', priority: 'Urgent', timeReceived: new Date(Date.now() - 1200000).toISOString() },
];

const mockDetail: PrescriptionDetail = {
  id: 'RX-88219',
  patientId: 'MRN-1100',
  prescribedBy: 'Dr. Emily Chen',
  drugs: [
    { id: 'D-1', drugName: 'Amoxicillin 500mg', dosage: '500mg', route: 'PO', frequency: 'TID x 7 days', quantity: 21, stockAvailable: 500, isSubstitutable: true, requiresBarcodeScan: true, scanned: false },
    { id: 'D-2', drugName: 'Ibuprofen 400mg', dosage: '400mg', route: 'PO', frequency: 'PRN Pain', quantity: 30, stockAvailable: 1200, isSubstitutable: true, requiresBarcodeScan: true, scanned: false },
  ],
  validationFlags: [],
  totalCost: 45.50,
};

const mockInventory: DispensingInventoryItem[] = [
  { id: 'INV-1', drugCode: 'NDC-112', drugName: 'Amoxicillin 500mg Cap', location: 'Aisle 2, Bin 4', currentStock: 500, batchNumber: 'AMX-221', expiryDate: '2026-12-01' },
];

const mockAlerts: DispensingAlert[] = [
  { id: 'ALT-PHARM-1', type: 'Interaction Warning', severity: 'warning', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'Active', message: 'Potential moderate interaction between RX-88221 requested items. Pharmacist review required before dispense.' },
];

export const pharmacyApi = {
  getDashboardSummary: async (filters: DispensingFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activePrescription: mockDetail,
      inventorySearch: mockInventory,
      alerts: mockAlerts,
    } as PharmacyDashboardData,
    message: 'Success', status: 200,
  }),

  scanDrugBarcode: async (prescriptionId: string, drugId: string, barcode: string) => ({ data: { success: true }, message: `Barcode validated for ${drugId}`, status: 200 }),
  dispensePrescription: async (prescriptionId: string) => ({ data: { success: true }, message: `Prescription dispensed successfully`, status: 200 }),
  processPayment: async (prescriptionId: string, amount: number) => ({ data: { success: true }, message: `Payment of $${amount} processed`, status: 200 }),
  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
