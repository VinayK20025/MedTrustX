/**
 * MedTrustX — Board/Executive Module Types
 */

export interface KPI {
  id: string;
  title: string;
  value: string | number;
  format: 'currency' | 'percentage' | 'number' | 'ratio';
  trend: number; // percentage change
  trendDirection: 'up' | 'down' | 'neutral';
  status: 'good' | 'warning' | 'critical' | 'neutral';
  historicalData: { timestamp: string; value: number }[];
}

export interface FinancialMetrics {
  totalRevenue: KPI;
  netProfitMargin: KPI;
  operatingCosts: KPI;
  revenueByDepartment: { department: string; value: number; percentage: number }[];
  monthlyTrends: { month: string; revenue: number; costs: number; profit: number }[];
}

export interface ClinicalQualityMetrics {
  mortalityRate: KPI;
  infectionRate: KPI;
  readmissionRate: KPI;
  averageLengthOfStay: KPI;
  qualityByDepartment: { department: string; score: number; target: number }[];
  monthlyTrends: { month: string; mortality: number; infection: number; readmission: number }[];
}

export interface OperationsMetrics {
  bedOccupancyRate: KPI;
  otUtilization: KPI;
  erWaitTimeAvg: KPI;
  throughput: KPI;
  occupancyByUnit: { unit: string; current: number; capacity: number }[];
}

export interface RiskAndComplianceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'clinical' | 'financial' | 'compliance' | 'operational';
  message: string;
  timestamp: string;
  hospitalId?: string;
  unit?: string;
}

export interface HospitalComparison {
  hospitalId: string;
  name: string;
  revenue: number;
  occupancyRate: number;
  mortalityRate: number;
  complianceScore: number;
}

export interface BoardDashboardData {
  summaryKpis: KPI[];
  financial: FinancialMetrics;
  clinical: ClinicalQualityMetrics;
  operations: OperationsMetrics;
  recentAlerts: RiskAndComplianceAlert[];
  hospitalComparisons: HospitalComparison[];
}
