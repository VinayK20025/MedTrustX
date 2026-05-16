/**
 * MedTrustX — CEO Module Types
 */

export interface CeoKPI {
  id: string;
  title: string;
  value: string | number;
  format: 'currency' | 'percentage' | 'number' | 'ratio';
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  status: 'good' | 'warning' | 'critical' | 'neutral';
  actionLabel?: string;
  actionUrl?: string;
}

export interface CeoTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'financial' | 'operational' | 'clinical' | 'hr';
  timestamp: string;
  status: 'pending' | 'in_progress' | 'completed';
  requester: string;
  actions: string[]; // e.g. ["Approve", "Reject", "Escalate"]
}

export interface ActionableAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'operational' | 'clinical' | 'financial' | 'compliance';
  message: string;
  timestamp: string;
  hospitalId?: string;
  unit?: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface OperationsMetrics {
  bedOccupancyRate: number;
  icuLoad: number;
  pendingDischarges: number;
  erWaitTimeAvg: number;
  otBacklog: number;
  criticalBottlenecks: number;
}

export interface FinancialOverview {
  revenueToday: number;
  revenueVsTarget: number; // percentage
  operationalCosts: number;
  pendingApprovalsValue: number; // currency
  monthlyTrend: { date: string; revenue: number; costs: number }[];
}

export interface CeoDashboardData {
  kpis: CeoKPI[];
  operations: OperationsMetrics;
  financial: FinancialOverview;
  tasks: CeoTask[];
  alerts: ActionableAlert[];
}
