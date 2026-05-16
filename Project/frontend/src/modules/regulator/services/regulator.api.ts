import { apiGet, apiPost } from '@/services/api';
import type { RegulatorDashboardData, RegulatorySubmission, InstitutionalLicense, RegulatoryDirective } from '../types/regulator.types';

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const f = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockSubmissions: RegulatorySubmission[] = [
  { id: 'SUB-2024-01', title: 'Q1 Infectious Disease Stats', body: 'Ministry of Health', submittedAt: d(5), status: 'Approved', category: 'Public Health Data' },
  { id: 'SUB-2024-02', title: 'MRI Calibration Annual Review', body: 'Radiation Safety Board', submittedAt: d(2), status: 'Received', category: 'Annual Report' },
  { id: 'SUB-2024-03', title: 'Staff Clinical Competency Audit', body: 'Medical Council', submittedAt: d(12), status: 'Query Raised', category: 'Licensing Renewal' },
];

const mockLicenses: InstitutionalLicense[] = [
  { id: 'LIC-772-H', type: 'General Hospital License', issuedBy: 'Ministry of Health', validFrom: d(350), validUntil: f(15), status: 'Expiring Soon' },
  { id: 'LIC-RAD-01', type: 'Diagnostic Imaging (X-Ray/CT)', issuedBy: 'Radiation Safety Board', validFrom: d(200), validUntil: f(165), status: 'Active' },
];

const mockDirectives: RegulatoryDirective[] = [
  { id: 'DIR-882', body: 'Ministry of Health', priority: 'High', title: 'New COVID-19 Variant Screening Protocol', receivedAt: d(1), deadline: f(3), acknowledged: false },
  { id: 'DIR-891', body: 'Drug Control Authority', priority: 'Immediate Action', title: 'Recall Notice: Batch #AX-202 Pharmaceutical', receivedAt: d(0), deadline: d(-1), acknowledged: true },
];

const mockData: RegulatorDashboardData = {
  metrics: {
    totalSubmissionsYTD: 142,
    pendingRegulatoryQueries: 3,
    activeLicensesCount: 18,
    unacknowledgedDirectives: 1,
    complianceScorePercent: 98.4
  },
  recentSubmissions: mockSubmissions,
  expiringLicenses: mockLicenses,
  activeDirectives: mockDirectives
};

export const regulatorApi = {
  getDashboardData: async (): Promise<{ data: RegulatorDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: RegulatorDashboardData }>('/api/v1/regulator/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  acknowledgeDirective: async (directiveId: string) => {
    try {
      return await apiPost(`/api/v1/regulator/directives/${directiveId}/acknowledge`, {});
    } catch {
      return { data: { success: true }, message: 'Directive acknowledged (Mock)', status: 200 };
    }
  }
};
