import type {
  BillingDashboardData, BillingKPI, BillingPatient, BillLineItem,
  BillSummary, PaymentRecord, InsuranceClaim
} from '../types/billing.types';

export interface BillingFilters { type?: 'OPD' | 'IPD'; status?: string; }

const mockKpis: BillingKPI[] = [
  { id: '1', title: 'Bills Today', value: 95, format: 'number', status: 'normal' },
  { id: '2', title: 'Revenue Today', value: 420000, format: 'currency', status: 'success' },
  { id: '3', title: 'Pending Payments', value: 6, format: 'number', status: 'warning' },
  { id: '4', title: 'Insurance Claims', value: 14, format: 'number', status: 'normal' },
];

const mockPatients: BillingPatient[] = [
  { id: 'BP-1', patientName: 'Anita Sharma', mrn: 'MRN-9901', type: 'IPD', department: 'Cardiology', billStatus: 'Draft', totalAmount: 52400, paidAmount: 0 },
  { id: 'BP-2', patientName: 'Rajesh Kumar', mrn: 'MRN-4420', type: 'OPD', department: 'Orthopedics', billStatus: 'Paid', totalAmount: 2500, paidAmount: 2500 },
  { id: 'BP-3', patientName: 'Vikram Singh', mrn: 'MRN-3301', type: 'IPD', department: 'Cardiology', billStatus: 'Partial', totalAmount: 142500, paidAmount: 120000 },
  { id: 'BP-4', patientName: 'Maya Devi', mrn: 'MRN-4402', type: 'IPD', department: 'Neurology', billStatus: 'Pending', totalAmount: 88000, paidAmount: 0 },
];

const mockLineItems: BillLineItem[] = [
  { id: 'LI-1', serviceName: 'Cardiology Consultation', category: 'Consultation', quantity: 1, unitPrice: 1500, amount: 1500, source: 'OPD' },
  { id: 'LI-2', serviceName: 'ECG (12-Lead)', category: 'Procedure', quantity: 1, unitPrice: 800, amount: 800, source: 'Diagnostics' },
  { id: 'LI-3', serviceName: 'Complete Blood Count', category: 'Lab', quantity: 1, unitPrice: 450, amount: 450, source: 'Lab' },
  { id: 'LI-4', serviceName: 'Lipid Profile', category: 'Lab', quantity: 1, unitPrice: 650, amount: 650, source: 'Lab' },
  { id: 'LI-5', serviceName: 'Atorvastatin 20mg (30 tabs)', category: 'Pharmacy', quantity: 1, unitPrice: 320, amount: 320, source: 'Pharmacy' },
  { id: 'LI-6', serviceName: 'ICU Room Charges (5 days)', category: 'Room', quantity: 5, unitPrice: 8000, amount: 40000, source: 'Ward' },
  { id: 'LI-7', serviceName: 'Cardiac Catheterization', category: 'Procedure', quantity: 1, unitPrice: 8500, amount: 8500, source: 'Cath Lab', hasDuplicate: true },
];

const mockSummary: BillSummary = {
  subtotal: 52220, discount: 2220, discountPercent: 4.25, tax: 400,
  netPayable: 50400, amountPaid: 0, balance: 50400, insuranceCovered: 0,
};

const mockPayments: PaymentRecord[] = [
  { id: 'PAY-1', method: 'Cash', amount: 5000, timestamp: new Date(Date.now() - 3600000).toISOString() },
];

const mockClaims: InsuranceClaim[] = [
  { id: 'CL-1', patientName: 'Vikram Singh', provider: 'Star Health', policyNumber: 'SH-29881', claimAmount: 120000, status: 'Approved' },
  { id: 'CL-2', patientName: 'Maya Devi', provider: 'ICICI Lombard', policyNumber: 'IL-45230', claimAmount: 75000, status: 'Pending' },
];

export const billingApi = {
  getDashboardSummary: async (filters: BillingFilters) => ({
    data: { kpis: mockKpis, patients: mockPatients, lineItems: mockLineItems, summary: mockSummary, payments: mockPayments, claims: mockClaims } as BillingDashboardData,
    message: 'Success', status: 200,
  }),
  addService: async (billId: string, serviceId: string) => ({ data: { success: true }, message: 'Service added to bill', status: 200 }),
  applyDiscount: async (billId: string, percent: number) => ({ data: { success: true }, message: `${percent}% discount applied`, status: 200 }),
  processPayment: async (billId: string, method: string, amount: number) => ({ data: { success: true }, message: 'Payment processed', status: 200 }),
  finalizeBill: async (billId: string) => ({ data: { success: true }, message: 'Bill finalized and locked', status: 200 }),
};
