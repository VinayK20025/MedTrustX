/**
 * MedTrustX — CMO API Client
 */
import { apiGet, apiPost } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type { CmoDashboardData, ClinicalAlert } from '../types/cmo.types';

const BASE_URL = '/api/v1/clinical/cmo';

export interface CmoFilters {
  departmentId?: string;
  timeWindow?: '30d' | '90d' | 'ytd';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CmoDashboardData['kpis'] = [
  { id: '1', title: 'Mortality Rate', value: '1.2%', trend: '-0.1%', severity: 'good', actionLabel: 'Review', actionUrl: '/dashboard/cmo/mortality' },
  { id: '2', title: 'Infection Rate', value: '3.4%', trend: '+0.5%', severity: 'warning', actionLabel: 'Analyze', actionUrl: '/dashboard/cmo/infection' },
  { id: '3', title: 'Readmission Rate', value: '8.5%', trend: '+1.2%', severity: 'critical', actionLabel: 'Audit', actionUrl: '/dashboard/cmo/outcomes' },
  { id: '4', title: 'Avg LOS', value: '4.2 d', trend: '-0.2 d', severity: 'good', actionLabel: 'View', actionUrl: '/dashboard/cmo/outcomes' },
];

const mockOutcomes: CmoDashboardData['outcomes'] = {
  mortalityRate: 1.2,
  readmissionRate: 8.5,
  avgLos: 4.2,
  complicationsRate: 2.1,
  monthlyTrend: [
    { date: 'Jan', mortality: 1.3, readmission: 7.8 },
    { date: 'Feb', mortality: 1.2, readmission: 8.1 },
    { date: 'Mar', mortality: 1.1, readmission: 8.3 },
    { date: 'Apr', mortality: 1.2, readmission: 8.5 },
  ]
};

const mockInfection: CmoDashboardData['infection'] = {
  currentRate: 3.4,
  targetRate: 2.5,
  wardHeatmap: [
    { ward: 'ICU-A', score: 4.2, status: 'critical' },
    { ward: 'Surgery-East', score: 3.8, status: 'warning' },
    { ward: 'General-West', score: 1.5, status: 'good' },
    { ward: 'Maternity', score: 0.8, status: 'good' },
  ]
};

const mockAudit: CmoDashboardData['audit'] = {
  pendingAudits: 14,
  protocolDeviations: 8,
  complianceScore: 92,
  recentFlags: [
    { id: 'F1', type: 'Sepsis Protocol Delay', ward: 'ER', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'F2', type: 'Missing DVT Prophylaxis', ward: 'Surgery', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 'F3', type: 'Unsigned Clinical Note', ward: 'ICU-B', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ]
};

const mockIcu: CmoDashboardData['icuOversight'] = {
  criticalPatients: 18,
  sepsisCases: 4,
  ventilatorUtilization: 65,
  mortalityRiskAvg: 42.5,
};

const mockAlerts: ClinicalAlert[] = [
  { id: 'A1', type: 'critical', message: 'Sepsis bundle compliance drop detected in ER (< 75%).', timestamp: new Date().toISOString(), department: 'ER', actionRequired: true, actionUrl: '/dashboard/cmo/compliance' },
  { id: 'A2', type: 'warning', message: 'Antibiotic stewardship flag: 3 cases of prolonged broad-spectrum use.', timestamp: new Date(Date.now() - 1800000).toISOString(), department: 'ICU-A', actionRequired: true },
  { id: 'A3', type: 'audit', message: 'Mortality review pending for Case #8821.', timestamp: new Date(Date.now() - 86400000).toISOString(), department: 'Surgery', actionRequired: true, actionUrl: '/dashboard/cmo/mortality' },
];

/* ── API Service ───────────────────────────────────────── */

export const cmoApi = {
  getDashboardSummary: async (filters: CmoFilters) => ({
    data: {
      kpis: mockKpis,
      outcomes: mockOutcomes,
      infection: mockInfection,
      audit: mockAudit,
      icuOversight: mockIcu,
      alerts: mockAlerts,
    } as CmoDashboardData,
    message: 'Success',
    status: 200,
  }),

  initiateAudit: async (caseId: string) => {
    return { data: { success: true }, message: 'Audit initiated', status: 200 };
  },

  escalateAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert escalated', status: 200 };
  }
};
