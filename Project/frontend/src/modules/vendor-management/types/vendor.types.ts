/**
 * MedTrustX — Vendor Management Service Types
 */

export type VendorCategory = 'Medical Supplies' | 'Pharmaceuticals' | 'IT Services' | 'Facility Management' | 'Staffing' | 'Equipment';
export type VendorStatus = 'Active' | 'Under Review' | 'Onboarding' | 'Suspended' | 'Terminated';
export type ContractStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Renewed' | 'Terminated';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  contactPerson: string;
  email: string;
  rating: number; // 1-5
  lastAuditDate: string;
}

export interface Contract {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  value: number;
  slaCompliancePercent: number;
}

export interface VendorAudit {
  id: string;
  vendorId: string;
  auditType: 'Security' | 'Financial' | 'Compliance' | 'Quality';
  result: 'Pass' | 'Fail' | 'Conditional';
  auditDate: string;
  nextAuditDate: string;
}

export interface VendorMetrics {
  totalActiveVendors: number;
  contractsExpiring90Days: number;
  averageSLACompliancePercent: number;
  criticalVendorsCount: number;
  pendingAuditsCount: number;
}

export interface VendorDashboardData {
  metrics: VendorMetrics;
  topVendors: Vendor[];
  expiringContracts: Contract[];
  recentAudits: VendorAudit[];
}
