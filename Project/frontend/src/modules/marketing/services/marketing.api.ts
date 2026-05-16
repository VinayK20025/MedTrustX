/**
 * MedTrustX — Marketing CMO API Client
 * Growth Engine data layer
 */
import type { MarketingDashboardData } from '../types/marketing.types';

const BASE_URL = '/api/v1/marketing';

export interface MarketingFilters {
  period?: 'today' | '7d' | '30d' | '90d' | 'ytd';
  channel?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: MarketingDashboardData['kpis'] = [
  { id: '1', title: 'Leads Generated', value: '1,842', status: 'positive', trend: '+14.2%', trendDirection: 'up', actionLabel: 'Lead Funnel', actionUrl: '/dashboard/marketing/funnel' },
  { id: '2', title: 'Conversion Rate', value: '18.6%', status: 'positive', trend: '+2.1%', trendDirection: 'up', actionLabel: 'Conversions', actionUrl: '/dashboard/marketing/acquisition' },
  { id: '3', title: 'CPA (Avg)', value: '₹1,240', status: 'warning', trend: '+₹80', trendDirection: 'up', actionLabel: 'Cost Analysis', actionUrl: '/dashboard/marketing/performance' },
  { id: '4', title: 'Campaign Revenue', value: '₹28.4L', status: 'positive', trend: '+18%', trendDirection: 'up', actionLabel: 'Revenue', actionUrl: '/dashboard/marketing/reports' },
  { id: '5', title: 'Overall ROI', value: '3.2x', status: 'positive', trend: '+0.4x', trendDirection: 'up', actionLabel: 'ROI Report', actionUrl: '/dashboard/marketing/reports' },
];

const mockCampaigns: MarketingDashboardData['campaigns'] = [
  { id: 'C1', name: 'Summer Health Checkup Drive', channel: 'google_ads', status: 'active', budget: 500000, spent: 320000, impressions: 284000, clicks: 12400, conversions: 842, cpa: 380, roi: 4.2, startDate: '2026-04-01' },
  { id: 'C2', name: 'Maternity Care Awareness', channel: 'meta', status: 'active', budget: 300000, spent: 210000, impressions: 195000, clicks: 8200, conversions: 456, cpa: 460, roi: 3.1, startDate: '2026-03-15' },
  { id: 'C3', name: 'Cardiac Screening Package', channel: 'email', status: 'active', budget: 100000, spent: 42000, impressions: 85000, clicks: 4800, conversions: 312, cpa: 135, roi: 8.4, startDate: '2026-04-10' },
  { id: 'C4', name: 'Eye Care Camp (Offline)', channel: 'offline', status: 'completed', budget: 200000, spent: 195000, impressions: 12000, clicks: 0, conversions: 680, cpa: 287, roi: 2.8, startDate: '2026-03-01', endDate: '2026-03-31' },
  { id: 'C5', name: 'Doctor Referral Program', channel: 'referral', status: 'active', budget: 150000, spent: 88000, impressions: 0, clicks: 0, conversions: 224, cpa: 393, roi: 5.6, startDate: '2026-01-01' },
];

const mockFunnel: MarketingDashboardData['funnel'] = [
  { stage: 'Awareness', count: 45200, conversionRate: 100, dropOff: 0 },
  { stage: 'Interest', count: 12400, conversionRate: 27.4, dropOff: 72.6 },
  { stage: 'Inquiry', count: 4800, conversionRate: 38.7, dropOff: 61.3 },
  { stage: 'Appointment', count: 1842, conversionRate: 38.4, dropOff: 61.6 },
  { stage: 'Converted', count: 842, conversionRate: 45.7, dropOff: 54.3 },
];

const mockChannels: MarketingDashboardData['channels'] = [
  { channel: 'Google Ads', leads: 620, conversions: 310, spend: 420000, cpa: 1355, roi: 3.8, trend: 12 },
  { channel: 'Meta (FB/IG)', leads: 480, conversions: 196, spend: 280000, cpa: 1429, roi: 2.9, trend: -5 },
  { channel: 'Email', leads: 312, conversions: 188, spend: 42000, cpa: 223, roi: 8.4, trend: 22 },
  { channel: 'Referral', leads: 224, conversions: 98, spend: 88000, cpa: 898, roi: 5.6, trend: 8 },
  { channel: 'Offline', leads: 206, conversions: 50, spend: 195000, cpa: 3900, roi: 1.2, trend: -15 },
];

const mockAlerts: MarketingDashboardData['alerts'] = [
  { id: 'A1', type: 'warning', category: 'CPA Spike', message: 'Meta campaign "Maternity Care" CPA up 18% — consider audience refinement.', campaign: 'Maternity Care Awareness', timestamp: new Date(Date.now() - 3600000).toISOString(), actionRequired: true },
  { id: 'A2', type: 'info', category: 'High Performer', message: 'Email campaign "Cardiac Screening" delivering 8.4x ROI — budget increase recommended.', campaign: 'Cardiac Screening Package', timestamp: new Date(Date.now() - 7200000).toISOString(), actionRequired: true },
  { id: 'A3', type: 'critical', category: 'Budget Alert', message: 'Google Ads campaign at 64% budget spend with 12 days remaining — pacing ahead.', campaign: 'Summer Health Checkup Drive', timestamp: new Date(Date.now() - 10800000).toISOString(), actionRequired: true },
];

/* ── API Service ───────────────────────────────────────── */

export const marketingApi = {
  getDashboardSummary: async (filters: MarketingFilters) => ({
    data: {
      kpis: mockKpis,
      campaigns: mockCampaigns,
      funnel: mockFunnel,
      channels: mockChannels,
      alerts: mockAlerts,
    } as MarketingDashboardData,
    message: 'Success',
    status: 200,
  }),

  pauseCampaign: async (campaignId: string) => {
    return { data: { success: true }, message: 'Campaign paused', status: 200 };
  },

  resolveAlert: async (alertId: string) => {
    return { data: { success: true }, message: 'Alert resolved', status: 200 };
  },
};
