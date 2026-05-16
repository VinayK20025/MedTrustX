/**
 * MedTrustX — CFO Module Types
 * Financial Intelligence & Revenue Optimization domain models
 */

export interface CfoKPI {
  id: string;
  title: string;
  value: string;
  status: 'positive' | 'warning' | 'negative' | 'neutral';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  actionLabel?: string;
  actionUrl?: string;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CostCenter {
  id: string;
  department: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export interface CashFlowEntry {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

export interface InsuranceClaim {
  id: string;
  patientName: string;
  provider: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  category: string;
}

export interface CfoAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  amount?: number;
  timestamp: string;
  actionRequired: boolean;
}

export interface CfoDashboardData {
  kpis: CfoKPI[];
  revenueTrends: RevenueTrend[];
  costCenters: CostCenter[];
  cashFlow: CashFlowEntry[];
  claims: InsuranceClaim[];
  alerts: CfoAlert[];
}
