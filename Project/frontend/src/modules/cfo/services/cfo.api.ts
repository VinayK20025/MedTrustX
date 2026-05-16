/**
 * MedTrustX — CFO API Client
 * Financial Intelligence data layer
 */
import type { CfoDashboardData } from '../types/cfo.types';

const BASE_URL = '/api/v1/finance/cfo';

export interface CfoFilters {
  period?: 'mtd' | 'qtd' | 'ytd' | 'custom';
  department?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: CfoDashboardData['kpis'] = [
  { id: '1', title: 'Total Revenue (MTD)', value: '₹4.82 Cr', status: 'positive', trend: '+12.4%', trendDirection: 'up', actionLabel: 'Revenue Details', actionUrl: '/dashboard/cfo/billing' },
  { id: '2', title: 'Net Profit', value: '₹1.24 Cr', status: 'positive', trend: '+8.1%', trendDirection: 'up', actionLabel: 'P&L Report', actionUrl: '/dashboard/cfo/reports' },
  { id: '3', title: 'Outstanding Receivables', value: '₹67.3 L', status: 'warning', trend: '+₹8.2L', trendDirection: 'up', actionLabel: 'Collections', actionUrl: '/dashboard/cfo/payments' },
  { id: '4', title: 'Claim Approval Rate', value: '87.2%', status: 'warning', trend: '-2.1%', trendDirection: 'down', actionLabel: 'Claims Queue', actionUrl: '/dashboard/cfo/claims' },
  { id: '5', title: 'Cost-to-Revenue', value: '74.3%', status: 'neutral', trend: '-0.5%', trendDirection: 'down', actionLabel: 'Cost Analysis', actionUrl: '/dashboard/cfo/cost' },
];

const mockRevenueTrends: CfoDashboardData['revenueTrends'] = [
  { month: 'Nov', revenue: 380, expenses: 290, profit: 90 },
  { month: 'Dec', revenue: 420, expenses: 310, profit: 110 },
  { month: 'Jan', revenue: 395, expenses: 305, profit: 90 },
  { month: 'Feb', revenue: 445, expenses: 320, profit: 125 },
  { month: 'Mar', revenue: 460, expenses: 335, profit: 125 },
  { month: 'Apr', revenue: 482, expenses: 358, profit: 124 },
];

const mockCostCenters: CfoDashboardData['costCenters'] = [
  { id: 'D1', department: 'ICU', budget: 85, actual: 92, variance: -7, variancePercent: -8.2 },
  { id: 'D2', department: 'Pharmacy', budget: 120, actual: 115, variance: 5, variancePercent: 4.2 },
  { id: 'D3', department: 'Diagnostics', budget: 65, actual: 68, variance: -3, variancePercent: -4.6 },
  { id: 'D4', department: 'Surgery (OT)', budget: 95, actual: 88, variance: 7, variancePercent: 7.4 },
  { id: 'D5', department: 'Emergency', budget: 45, actual: 52, variance: -7, variancePercent: -15.6 },
];

const mockCashFlow: CfoDashboardData['cashFlow'] = [
  { month: 'Nov', inflow: 395, outflow: 340, netFlow: 55 },
  { month: 'Dec', inflow: 430, outflow: 365, netFlow: 65 },
  { month: 'Jan', inflow: 410, outflow: 355, netFlow: 55 },
  { month: 'Feb', inflow: 460, outflow: 375, netFlow: 85 },
  { month: 'Mar', inflow: 475, outflow: 390, netFlow: 85 },
  { month: 'Apr', inflow: 490, outflow: 405, netFlow: 85 },
];

const mockClaims: CfoDashboardData['claims'] = [
  { id: 'CLM-4021', patientName: 'Ravi Sharma', provider: 'Star Health', amount: 245000, status: 'pending', submittedAt: new Date(Date.now() - 86400000).toISOString(), category: 'Surgery' },
  { id: 'CLM-4020', patientName: 'Sunita Patel', provider: 'ICICI Lombard', amount: 89000, status: 'under_review', submittedAt: new Date(Date.now() - 172800000).toISOString(), category: 'ICU Stay' },
  { id: 'CLM-4019', patientName: 'Mohan K.', provider: 'HDFC Ergo', amount: 156000, status: 'rejected', submittedAt: new Date(Date.now() - 259200000).toISOString(), category: 'Diagnostics' },
];

const mockAlerts: CfoDashboardData['alerts'] = [
  { id: 'A1', type: 'critical', category: 'Revenue Leakage', message: 'Emergency department billing under-captured by ₹4.8L this month — unbilled procedures detected.', amount: 480000, timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'warning', category: 'Budget Overrun', message: 'ICU department has exceeded monthly budget by 8.2% (₹7L over allocation).', amount: 700000, timestamp: new Date(Date.now() - 7200000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'warning', category: 'Claims', message: 'HDFC Ergo claim CLM-4019 rejected — documentation incomplete. ₹1.56L at risk.', amount: 156000, timestamp: new Date(Date.now() - 10800000).toISOString(), actionRequired: true },
  { id: 'A4', type: 'info', category: 'Cash Flow', message: 'Net cash position trending positive — ₹85L net inflow in April so far.', timestamp: new Date(Date.now() - 14400000).toISOString(), actionRequired: false },
];

/* ── API Service ───────────────────────────────────────── */

export const cfoApi = {
  getDashboardSummary: async (filters: CfoFilters) => ({
    data: {
      kpis: mockKpis,
      revenueTrends: mockRevenueTrends,
      costCenters: mockCostCenters,
      cashFlow: mockCashFlow,
      claims: mockClaims,
      alerts: mockAlerts,
    } as CfoDashboardData,
    message: 'Success',
    status: 200,
  }),

  approveClaim: async (claimId: string) => {
    return { data: { success: true }, message: 'Claim approved', status: 200 };
  },

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  },
};
