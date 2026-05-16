import { apiGet, apiPost } from '@/services/api';
import type { InsuranceDashboardData, InsuranceClaim, InsurancePayer, DenialAnalytic } from '../types/insurance.types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();

const mockClaims: InsuranceClaim[] = [
  { id: 'CLM-9001', patientId: 'PAT-442', patientName: 'John Doe', payerId: 'PYR-001', payerName: 'Blue Shield', serviceDate: d(2), amount: 4500.50, status: 'Submitted' },
  { id: 'CLM-9002', patientId: 'PAT-129', patientName: 'Jane Smith', payerId: 'PYR-002', payerName: 'Aetna Health', serviceDate: d(5), amount: 1250.00, status: 'Paid', reimbursementAmount: 1180.00, remittanceRef: '835-AX-442' },
  { id: 'CLM-9003', patientId: 'PAT-773', patientName: 'Robert Brown', payerId: 'PYR-001', payerName: 'Blue Shield', serviceDate: d(1), amount: 890.00, status: 'Denied', denialReason: 'Missing Prior Auth', denialCategory: 'Prior Auth' },
  { id: 'CLM-9004', patientId: 'PAT-881', patientName: 'Emily White', payerId: 'PYR-003', payerName: 'Government Health Scheme', serviceDate: d(10), amount: 15200.00, status: 'Appealed', denialCategory: 'Documentation' },
];

const mockPayers: InsurancePayer[] = [
  { id: 'PYR-001', name: 'Blue Shield', type: 'Private', claimSuccessRatePercent: 92.4, averageReimbursementDays: 14, activeContractId: 'CTR-BS-2024' },
  { id: 'PYR-002', name: 'Aetna Health', type: 'Private', claimSuccessRatePercent: 88.7, averageReimbursementDays: 18, activeContractId: 'CTR-AH-2024', tpaAssociated: 'MediManage TPA' },
  { id: 'PYR-003', name: 'National Health Authority', type: 'Government Scheme', claimSuccessRatePercent: 76.5, averageReimbursementDays: 45, activeContractId: 'GOV-2024-NHA' },
];

const mockDenials: DenialAnalytic[] = [
  { category: 'Prior Auth', count: 42, value: 125000, trend: 'up' },
  { category: 'Eligibility', count: 28, value: 45000, trend: 'down' },
  { category: 'Documentation', count: 15, value: 89000, trend: 'stable' },
];

const mockData: InsuranceDashboardData = {
  metrics: {
    totalClaimsValue: 1250000,
    cleanClaimRatePercent: 94.2,
    denialRatePercent: 5.8,
    averageDaysInAR: 22,
    eligibilityCheckVolume: 1420,
    totalReimbursedValue: 980000,
    pendingAppealsCount: 12
  },
  recentClaims: mockClaims,
  pendingAuthorizations: [
    { id: 'AUTH-101', patientId: 'PAT-442', procedureCode: 'MRI-LUMBAR', payerId: 'PYR-001', status: 'Pending', requestedAt: h(4), expiresAt: d(-30) }
  ],
  topPayers: mockPayers,
  denialAnalytics: mockDenials
};

export const insuranceApi = {
  getDashboardData: async (): Promise<{ data: InsuranceDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: InsuranceDashboardData }>('/api/v1/insurance/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  verifyEligibility: async (patientId: string, payerId: string) => {
    try {
      return await apiPost('/api/v1/insurance/verify-eligibility', { patientId, payerId });
    } catch {
      return { data: { eligible: true, coverage: 'Full' }, message: 'Eligibility verified (Mock)', status: 200 };
    }
  }
};
