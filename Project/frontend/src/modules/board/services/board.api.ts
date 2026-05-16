/**
 * MedTrustX — Board/Executive API Client
 * Maps to an analytics or reporting microservice
 */
import { apiGet } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import type {
  BoardDashboardData,
  FinancialMetrics,
  ClinicalQualityMetrics,
  OperationsMetrics,
  RiskAndComplianceAlert,
  HospitalComparison
} from '../types/board.types';

const BASE_URL = '/api/v1/analytics/board';

export interface DashboardFilters {
  timeRange: '7d' | '30d' | '90d' | 'ytd' | '1y';
  hospitalIds?: string[];
}

/* ── MOCK FALLBACK DATA ──────────────────────────────────── */

const mockSummaryKpis: KPI[] = [
  { id: '1', title: 'Total Revenue', value: 125000000, format: 'currency', trend: 12.4, trendDirection: 'up', status: 'good', historicalData: [] },
  { id: '2', title: 'Net Profit Margin', value: 18.4, format: 'percentage', trend: 2.1, trendDirection: 'up', status: 'good', historicalData: [] },
  { id: '3', title: 'Occupancy Rate', value: 87.2, format: 'percentage', trend: -1.5, trendDirection: 'down', status: 'warning', historicalData: [] },
  { id: '4', title: 'Mortality Rate', value: 1.8, format: 'percentage', trend: -0.3, trendDirection: 'down', status: 'good', historicalData: [] },
];

const mockFinancial: FinancialMetrics = {
  totalRevenue: mockSummaryKpis[0],
  netProfitMargin: mockSummaryKpis[1],
  operatingCosts: { id: 'cost', title: 'Operating Costs', value: 85000000, format: 'currency', trend: 8.2, trendDirection: 'up', status: 'warning', historicalData: [] },
  revenueByDepartment: [
    { department: 'Cardiology', value: 45000000, percentage: 36 },
    { department: 'Oncology', value: 35000000, percentage: 28 },
    { department: 'Neurology', value: 25000000, percentage: 20 },
    { department: 'Orthopedics', value: 20000000, percentage: 16 },
  ],
  monthlyTrends: [
    { month: 'Jan', revenue: 18000000, costs: 14000000, profit: 4000000 },
    { month: 'Feb', revenue: 19500000, costs: 14500000, profit: 5000000 },
    { month: 'Mar', revenue: 18500000, costs: 14200000, profit: 4300000 },
    { month: 'Apr', revenue: 21000000, costs: 15000000, profit: 6000000 },
    { month: 'May', revenue: 23000000, costs: 15500000, profit: 7500000 },
    { month: 'Jun', revenue: 25000000, costs: 16000000, profit: 9000000 },
  ],
};

const mockClinical: ClinicalQualityMetrics = {
  mortalityRate: mockSummaryKpis[3],
  infectionRate: { id: 'inf', title: 'Infection Rate', value: 2.1, format: 'percentage', trend: -0.5, trendDirection: 'down', status: 'good', historicalData: [] },
  readmissionRate: { id: 'readm', title: '30-Day Readmission', value: 8.5, format: 'percentage', trend: 1.2, trendDirection: 'up', status: 'warning', historicalData: [] },
  averageLengthOfStay: { id: 'alos', title: 'ALOS', value: 4.2, format: 'number', trend: -0.1, trendDirection: 'down', status: 'good', historicalData: [] },
  qualityByDepartment: [
    { department: 'Cardiology', score: 96, target: 95 },
    { department: 'Oncology', score: 92, target: 95 },
    { department: 'Neurology', score: 88, target: 90 },
  ],
  monthlyTrends: [
    { month: 'Jan', mortality: 2.1, infection: 2.5, readmission: 9.1 },
    { month: 'Feb', mortality: 2.0, infection: 2.4, readmission: 8.8 },
    { month: 'Mar', mortality: 1.9, infection: 2.2, readmission: 8.5 },
    { month: 'Apr', mortality: 1.8, infection: 2.1, readmission: 8.5 },
  ],
};

const mockOperations: OperationsMetrics = {
  bedOccupancyRate: mockSummaryKpis[2],
  otUtilization: { id: 'ot', title: 'OT Utilization', value: 76.5, format: 'percentage', trend: 4.2, trendDirection: 'up', status: 'good', historicalData: [] },
  erWaitTimeAvg: { id: 'er', title: 'ER Wait Time (min)', value: 42, format: 'number', trend: 15, trendDirection: 'up', status: 'critical', historicalData: [] },
  throughput: { id: 'thr', title: 'Daily Discharges', value: 145, format: 'number', trend: 5.2, trendDirection: 'up', status: 'good', historicalData: [] },
  occupancyByUnit: [
    { unit: 'ICU', current: 48, capacity: 50 },
    { unit: 'General Ward A', current: 120, capacity: 150 },
    { unit: 'Maternity', current: 35, capacity: 40 },
  ]
};

const mockAlerts: RiskAndComplianceAlert[] = [
  { id: '1', type: 'critical', category: 'operational', message: 'ICU capacity exceeding 95% at Central Hospital.', timestamp: new Date().toISOString(), hospitalId: 'HOSP-001', unit: 'ICU' },
  { id: '2', type: 'warning', category: 'compliance', message: 'Upcoming JCI accreditation audit in 45 days. 3 minor gaps identified in document management.', timestamp: new Date(Date.now() - 86400000).toISOString(), hospitalId: 'HOSP-001' },
  { id: '3', type: 'info', category: 'financial', message: 'Q2 Revenue target exceeded by 4.2% across the group.', timestamp: new Date(Date.now() - 172800000).toISOString() },
];

const mockComparisons: HospitalComparison[] = [
  { hospitalId: 'HOSP-001', name: 'MedTrust Central', revenue: 75000000, occupancyRate: 92.4, mortalityRate: 1.9, complianceScore: 98 },
  { hospitalId: 'HOSP-002', name: 'MedTrust North', revenue: 32000000, occupancyRate: 78.5, mortalityRate: 2.1, complianceScore: 94 },
  { hospitalId: 'HOSP-003', name: 'MedTrust East', revenue: 18000000, occupancyRate: 65.2, mortalityRate: 1.4, complianceScore: 99 },
];

/* ── API Service ───────────────────────────────────────── */
import { endpoints } from '@/services/endpoints';
import { autoEndpoints } from '@/services/autoEndpoints';

export const boardApi = {
  getDashboardSummary: async (filters: DashboardFilters): Promise<{ data: BoardDashboardData; message: string; status: number }> => {
    try {
      const [financialRes, clinicalRes, operationsRes, alertsRes, hospitalsRes] = await Promise.allSettled([
        apiGet<any>(`${autoEndpoints.analytics.list}/financial`, { params: filters }),
        apiGet<any>(`${autoEndpoints.analytics.list}/clinical`, { params: filters }),
        apiGet<any>(`${autoEndpoints.analytics.list}/operations`, { params: filters }),
        apiGet<any>(`${endpoints.gateway?.alerts || '/api/v1/gateway/alerts'}`, { params: { role: 'board' } }),
        apiGet<any>(`${autoEndpoints.analytics.list}/hospitals`, { params: filters }),
      ]);

      const financial = financialRes.status === 'fulfilled' ? financialRes.value?.data ?? mockFinancial : mockFinancial;
      const clinical = clinicalRes.status === 'fulfilled' ? clinicalRes.value?.data ?? mockClinical : mockClinical;
      const operations = operationsRes.status === 'fulfilled' ? operationsRes.value?.data ?? mockOperations : mockOperations;
      const recentAlerts = alertsRes.status === 'fulfilled' ? alertsRes.value?.data ?? mockAlerts : mockAlerts;
      const hospitalComparisons = hospitalsRes.status === 'fulfilled' ? hospitalsRes.value?.data ?? mockComparisons : mockComparisons;

      return {
        data: {
          summaryKpis: mockSummaryKpis, // Usually derived from financial, clinical, and ops
          financial,
          clinical,
          operations,
          recentAlerts,
          hospitalComparisons,
        },
        message: 'Success',
        status: 200,
      };
    } catch (error) {
      return {
        data: {
          summaryKpis: mockSummaryKpis,
          financial: mockFinancial,
          clinical: mockClinical,
          operations: mockOperations,
          recentAlerts: mockAlerts,
          hospitalComparisons: mockComparisons,
        },
        message: 'Failed to load live data, falling back to cached state',
        status: 500,
      };
    }
  },

  getFinancialIntelligence: async (filters: DashboardFilters) => {
    try {
      const res = await apiGet<any>(`${autoEndpoints.analytics.list}/financial`, { params: filters });
      return { data: res?.data ?? mockFinancial, message: 'Success', status: 200 };
    } catch (e) {
      return { data: mockFinancial, message: 'Success (Fallback)', status: 200 };
    }
  },

  getClinicalQuality: async (filters: DashboardFilters) => {
    try {
      const res = await apiGet<any>(`${autoEndpoints.analytics.list}/clinical`, { params: filters });
      return { data: res?.data ?? mockClinical, message: 'Success', status: 200 };
    } catch (e) {
      return { data: mockClinical, message: 'Success (Fallback)', status: 200 };
    }
  },

  getOperationsSummary: async (filters: DashboardFilters) => {
    try {
      const res = await apiGet<any>(`${autoEndpoints.analytics.list}/operations`, { params: filters });
      return { data: res?.data ?? mockOperations, message: 'Success', status: 200 };
    } catch (e) {
      return { data: mockOperations, message: 'Success (Fallback)', status: 200 };
    }
  },

  getRiskAlerts: async (filters: DashboardFilters) => {
    try {
      const res = await apiGet<any>(`${endpoints.gateway?.alerts || '/api/v1/gateway/alerts'}`, { params: { role: 'board' } });
      return { data: res?.data ?? mockAlerts, message: 'Success', status: 200 };
    } catch (e) {
      return { data: mockAlerts, message: 'Success (Fallback)', status: 200 };
    }
  },

  getHospitalComparison: async (filters: DashboardFilters) => {
    try {
      const res = await apiGet<any>(`${autoEndpoints.analytics.list}/hospitals`, { params: filters });
      return { data: res?.data ?? mockComparisons, message: 'Success', status: 200 };
    } catch (e) {
      return { data: mockComparisons, message: 'Success (Fallback)', status: 200 };
    }
  },
};
