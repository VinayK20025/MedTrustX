/**
 * MedTrustX — Marketing CMO Module Types
 * Growth Engine & Patient Acquisition domain models
 */

export interface MarketingKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'positive' | 'warning' | 'negative' | 'neutral';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  actionLabel?: string;
  actionUrl?: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: 'google_ads' | 'meta' | 'email' | 'sms' | 'offline' | 'referral';
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roi: number;
  startDate: string;
  endDate?: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
  dropOff: number;
}

export interface ChannelMetric {
  channel: string;
  leads: number;
  conversions: number;
  spend: number;
  cpa: number;
  roi: number;
  trend: number;
}

export interface MarketingAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  campaign?: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface MarketingDashboardData {
  kpis: MarketingKPI[];
  campaigns: Campaign[];
  funnel: FunnelStage[];
  channels: ChannelMetric[];
  alerts: MarketingAlert[];
}
