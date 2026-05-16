/**
 * MedTrustX — Chief Pharmacist Types
 */

export interface PharmacyKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'currency' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface DrugInventoryItem {
  id: string;
  drugCode: string;
  drugName: string;
  category: 'Antibiotic' | 'Analgesic' | 'Anesthetic' | 'Cardiovascular' | 'Oncology' | 'Narcotic';
  currentStock: number;
  minimumThreshold: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';
  expiryDate: string;
  batchNumber: string;
}

export interface PurchaseOrder {
  id: string;
  vendorName: string;
  orderDate: string;
  totalAmount: number;
  status: 'Pending Approval' | 'Approved' | 'Shipped' | 'Delivered';
  itemsCount: number;
  expectedDelivery: string;
}

export interface AdverseDrugEvent {
  id: string;
  patientId: string;
  drugName: string;
  reactionType: 'Allergic' | 'Overdose' | 'Interaction' | 'Side Effect';
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening';
  reportedBy: string; // Doctor or Nurse ID
  timestamp: string;
  status: 'Investigating' | 'Resolved' | 'Reported to Regulator';
}

export interface DrugUsageMetric {
  department: string;
  drugName: string;
  quantityConsumed: number;
  costIncurred: number;
  trendPercentage: number; // e.g. +15% usage this month
}

export interface PharmacyAlert {
  id: string;
  type: 'Low Stock' | 'Adverse Event' | 'Formulary Violation' | 'Narcotic Discrepancy';
  severity: 'warning' | 'critical';
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  message: string;
}

export interface PharmacyChiefDashboardData {
  kpis: PharmacyKPI[];
  inventory: DrugInventoryItem[];
  purchaseOrders: PurchaseOrder[];
  adverseEvents: AdverseDrugEvent[];
  usageMetrics: DrugUsageMetric[];
  alerts: PharmacyAlert[];
}
