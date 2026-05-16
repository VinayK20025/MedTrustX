/**
 * MedTrustX — Billing Executive (Role 79) Types
 */

export interface BillingKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'currency';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface BillingPatient {
  id: string;
  patientName: string;
  mrn: string;
  type: 'OPD' | 'IPD';
  department: string;
  billStatus: 'Draft' | 'Finalized' | 'Paid' | 'Partial' | 'Pending';
  totalAmount: number;
  paidAmount: number;
}

export interface BillLineItem {
  id: string;
  serviceName: string;
  category: 'Consultation' | 'Lab' | 'Pharmacy' | 'Procedure' | 'Room' | 'Other';
  quantity: number;
  unitPrice: number;
  amount: number;
  source: string;
  hasDuplicate?: boolean;
}

export interface BillSummary {
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  netPayable: number;
  amountPaid: number;
  balance: number;
  insuranceCovered: number;
}

export interface PaymentRecord {
  id: string;
  method: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Cheque';
  amount: number;
  timestamp: string;
  reference?: string;
}

export interface InsuranceClaim {
  id: string;
  patientName: string;
  provider: string;
  policyNumber: string;
  claimAmount: number;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Pending';
}

export interface BillingDashboardData {
  kpis: BillingKPI[];
  patients: BillingPatient[];
  lineItems: BillLineItem[];
  summary: BillSummary;
  payments: PaymentRecord[];
  claims: InsuranceClaim[];
}
