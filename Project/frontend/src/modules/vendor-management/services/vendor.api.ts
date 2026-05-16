import { apiGet, apiPost } from '@/services/api';
import type { VendorDashboardData, Vendor, Contract } from '../types/vendor.types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockVendors: Vendor[] = [
  { id: 'VND-001', name: 'MedTech Solutions', category: 'Medical Supplies', status: 'Active', contactPerson: 'Robert Chen', email: 'robert@medtech.com', rating: 4.8, lastAuditDate: d(60) },
  { id: 'VND-002', name: 'Global Pharma Corp', category: 'Pharmaceuticals', status: 'Active', contactPerson: 'Alice Wong', email: 'alice@globalpharma.com', rating: 4.5, lastAuditDate: d(120) },
  { id: 'VND-003', name: 'CyberSecure IT', category: 'IT Services', status: 'Under Review', contactPerson: 'Kevin Miller', email: 'kevin@cybersecure.io', rating: 3.9, lastAuditDate: d(15) },
];

const mockContracts: Contract[] = [
  { id: 'CON-881', vendorId: 'VND-001', vendorName: 'MedTech Solutions', title: 'Surgical Gowns Master Agreement', startDate: d(300), endDate: f(65), status: 'Expiring Soon', value: 1250000, slaCompliancePercent: 99.2 },
  { id: 'CON-882', vendorId: 'VND-002', vendorName: 'Global Pharma Corp', title: 'Oncology Drug Supply', startDate: d(150), endDate: f(215), status: 'Active', value: 4800000, slaCompliancePercent: 94.5 },
];

const mockData: VendorDashboardData = {
  metrics: {
    totalActiveVendors: 156,
    contractsExpiring90Days: 12,
    averageSLACompliancePercent: 96.8,
    criticalVendorsCount: 8,
    pendingAuditsCount: 5
  },
  topVendors: mockVendors,
  expiringContracts: mockContracts,
  recentAudits: [
    { id: 'AUD-501', vendorId: 'VND-003', auditType: 'Security', result: 'Conditional', auditDate: d(5), nextAuditDate: f(25) }
  ]
};

export const vendorApi = {
  getDashboardData: async (): Promise<{ data: VendorDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: VendorDashboardData }>('/api/v1/vendor-mgmt/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateVendorStatus: async (vendorId: string, status: string) => {
    try {
      return await apiPost(`/api/v1/vendor-mgmt/vendors/${vendorId}/status`, { status });
    } catch {
      return { data: { success: true }, message: 'Vendor status updated (Mock)', status: 200 };
    }
  }
};
