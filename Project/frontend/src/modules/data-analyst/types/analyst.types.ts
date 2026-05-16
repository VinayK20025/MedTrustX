/**
 * MedTrustX — Data Analyst (Role 158) Types
 * Healthcare analytics, insights, reports, and visualizations.
 */

export type DatasetStatus = 'Active' | 'Refreshing' | 'Stale' | 'Error';
export type InsightSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Positive';
export type ReportStatus = 'Ready' | 'Generating' | 'Scheduled' | 'Failed';
export type ChartType = 'Line' | 'Bar' | 'Donut' | 'Area' | 'KPI';

export interface AnalyticsDataset {
  id: string;
  name: string;
  source: string;
  category: 'Clinical' | 'Operational' | 'Financial' | 'Quality';
  sizeRows: number;
  lastRefreshed: string;
  status: DatasetStatus;
  refreshSchedule: string;
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string;
  change: number;      // percentage change vs last period
  trend: 'up' | 'down' | 'flat';
  positive: boolean;   // whether up is good or bad
  category: 'Clinical' | 'Operational' | 'Financial' | 'Quality';
}

export interface TrendPoint {
  period: string;
  value: number;
}

export interface AnalyticsTrend {
  id: string;
  label: string;
  unit: string;
  color: string;
  points: TrendPoint[];
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  category: 'Clinical' | 'Operational' | 'Financial' | 'Quality';
  severity: InsightSeverity;
  impact: string;
  recommendation: string;
  detectedAt: string;
  status: 'New' | 'Reviewed' | 'Action Taken';
}

export interface AnalyticsReport {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  scheduledAt: string;
  generatedAt?: string;
  format: 'PDF' | 'Excel' | 'CSV';
  recipients: number;
}

export interface DistributionSegment {
  label: string;
  value: number;
  color: string;
}

export interface AnalystMetrics {
  patientsThisMonth: number;
  revenueThisMonth: number;    // in lakh INR
  bedOccupancy: number;        // percentage
  avgLOS: number;              // average length of stay in days
  readmissionRate: number;     // percentage
  netPromoterScore: number;
}

export interface DataAnalystData {
  metrics: AnalystMetrics;
  kpis: KPIMetric[];
  datasets: AnalyticsDataset[];
  trends: AnalyticsTrend[];
  insights: AnalyticsInsight[];
  reports: AnalyticsReport[];
  admissionsByDept: DistributionSegment[];
  revenueByPayer: DistributionSegment[];
}
