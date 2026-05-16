/**
 * MedTrustX — Hospital Administrator (Role 72) Types
 */

export interface AdminKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'currency';
  status: 'normal' | 'warning' | 'critical' | 'success';
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export interface BedOccupancyData {
  department: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number; // percentage
  status: 'Available' | 'Nearing Capacity' | 'Full';
}

export interface DepartmentPerformance {
  id: string;
  name: string;
  patientThroughput: number; // patients per day
  avgWaitTime: string; // e.g., '45 mins'
  efficiencyScore: number; // 0-100
  activeIssues: number;
  status: 'Optimal' | 'Degraded' | 'Critical';
}

export interface HospitalAlert {
  id: string;
  timestamp: string;
  domain: 'Clinical' | 'HR' | 'Finance' | 'Infrastructure' | 'Compliance';
  severity: 'Warning' | 'Critical';
  message: string;
  requiresAction: boolean;
}

export interface FinancialSnapshot {
  dailyRevenue: number;
  outstandingReceivables: number;
  operationalExpenses: number;
  profitMargin: number;
}

export interface AdminDashboardData {
  kpis: AdminKPI[];
  bedOccupancy: BedOccupancyData[];
  departments: DepartmentPerformance[];
  alerts: HospitalAlert[];
  finance: FinancialSnapshot;
}
