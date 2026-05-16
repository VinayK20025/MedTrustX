import type {
  CaseManagerDashboardData, CaseManagerKPI, ActiveCase,
  DischargePlan, InsuranceApproval, CaseAlert
} from '../types/caseManager.types';

export interface CaseFilters {
  status?: string;
}

const mockKpis: CaseManagerKPI[] = [
  { id: '1', title: 'Avg LOS (Days)', value: 4.2, format: 'number', status: 'success' },
  { id: '2', title: 'Discharge Delays', value: 3, format: 'number', status: 'warning', actionLabel: 'View Blockers', actionUrl: '/dashboard/case-management/alerts' },
  { id: '3', title: 'Insurance Denials', value: 1, format: 'number', status: 'critical', actionLabel: 'Appeal Claims', actionUrl: '/dashboard/case-management/insurance' },
  { id: '4', title: 'Active Cases', value: 45, format: 'number', status: 'normal' },
];

const mockCases: ActiveCase[] = [
  { id: 'CS-101', patientName: 'John Doe', mrn: 'MRN-4491', admissionDate: new Date(Date.now() - 432000000).toISOString(), currentLOS: 5, expectedLOS: 4, dischargeStatus: 'Delayed', caseCost: 12500 },
  { id: 'CS-102', patientName: 'Jane Smith', mrn: 'MRN-8821', admissionDate: new Date(Date.now() - 172800000).toISOString(), currentLOS: 2, expectedLOS: 3, dischargeStatus: 'Planning', caseCost: 4200 },
];

const mockDischarge: DischargePlan = {
  id: 'DP-101',
  caseId: 'CS-101',
  targetDate: new Date(Date.now() + 86400000).toISOString(),
  clinicalClearance: true,
  billingClearance: false,
  medicationReconciliation: true,
  postAcuteCare: 'Home',
  readinessScore: 66,
};

const mockInsurance: InsuranceApproval = {
  id: 'INS-101',
  caseId: 'CS-101',
  payerName: 'BlueCross Health',
  authNumber: 'AUTH-99182',
  status: 'Pending',
  daysApproved: 3,
  estimatedCoverage: 11000,
};

const mockAlerts: CaseAlert[] = [
  { id: 'ALT-CM-1', type: 'LOS Exceeded', severity: 'warning', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Active', message: 'Patient CS-101 has exceeded expected LOS by 1 day. Discharge blocked by Billing.' },
  { id: 'ALT-CM-2', type: 'Insurance Denied', severity: 'critical', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'Active', message: 'Extended stay authorization denied by BlueCross Health.' },
];

export const caseManagerApi = {
  getDashboardSummary: async (filters: CaseFilters) => ({
    data: {
      kpis: mockKpis,
      activeCases: mockCases,
      activeDischargePlan: mockDischarge,
      activeInsurance: mockInsurance,
      alerts: mockAlerts,
    } as CaseManagerDashboardData,
    message: 'Success', status: 200,
  }),

  updateDischargeClearance: async (caseId: string, type: string, value: boolean) => ({ data: { success: true }, message: `${type} clearance updated`, status: 200 }),
  appealInsuranceDenial: async (insuranceId: string) => ({ data: { success: true }, message: `Appeal submitted to payer`, status: 200 }),
  resolveAlert: async (alertId: string) => ({ data: { success: true }, message: 'Alert acknowledged', status: 200 }),
};
