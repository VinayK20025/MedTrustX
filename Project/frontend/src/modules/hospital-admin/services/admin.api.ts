import type {
  AdminDashboardData, AdminKPI, BedOccupancyData,
  DepartmentPerformance, HospitalAlert, FinancialSnapshot
} from '../types/admin.types';

export interface AdminFilters {
  dateRange?: 'today' | 'week' | 'month';
  department?: string;
}

const mockKpis: AdminKPI[] = [
  { id: '1', title: 'Overall Occupancy', value: '88%', format: 'text', status: 'warning', trend: 5, trendDirection: 'up' },
  { id: '2', title: 'Daily Revenue', value: 142500, format: 'currency', status: 'success', trend: 12, trendDirection: 'up' },
  { id: '3', title: 'Staff On Duty', value: 412, format: 'number', status: 'normal' },
  { id: '4', title: 'Active Incidents', value: 3, format: 'number', status: 'critical', trend: 1, trendDirection: 'up' },
];

const mockBeds: BedOccupancyData[] = [
  { department: 'Intensive Care Unit (ICU)', totalBeds: 40, occupiedBeds: 38, occupancyRate: 95, status: 'Full' },
  { department: 'Emergency Room (ER)', totalBeds: 60, occupiedBeds: 52, occupancyRate: 86, status: 'Nearing Capacity' },
  { department: 'Maternity Ward', totalBeds: 50, occupiedBeds: 30, occupancyRate: 60, status: 'Available' },
  { department: 'General Surgery', totalBeds: 80, occupiedBeds: 75, occupancyRate: 93, status: 'Nearing Capacity' },
];

const mockDepartments: DepartmentPerformance[] = [
  { id: 'DEP-ER', name: 'Emergency', patientThroughput: 145, avgWaitTime: '42 mins', efficiencyScore: 78, activeIssues: 2, status: 'Degraded' },
  { id: 'DEP-OPD', name: 'Outpatient Clinic', patientThroughput: 320, avgWaitTime: '15 mins', efficiencyScore: 94, activeIssues: 0, status: 'Optimal' },
  { id: 'DEP-SUR', name: 'Surgery', patientThroughput: 28, avgWaitTime: '0 mins', efficiencyScore: 88, activeIssues: 1, status: 'Optimal' },
];

const mockAlerts: HospitalAlert[] = [
  { id: 'ALT-1', timestamp: new Date(Date.now() - 900000).toISOString(), domain: 'Clinical', severity: 'Critical', message: 'ICU capacity exceeded 95%. Bed diversion protocols recommended.', requiresAction: true },
  { id: 'ALT-2', timestamp: new Date(Date.now() - 3600000).toISOString(), domain: 'Infrastructure', severity: 'Warning', message: 'MRI Scanner #2 scheduled for emergency maintenance.', requiresAction: false },
  { id: 'ALT-3', timestamp: new Date(Date.now() - 7200000).toISOString(), domain: 'HR', severity: 'Critical', message: 'Night shift nursing staff deficit in Maternity Ward (-3 RNs).', requiresAction: true },
];

const mockFinance: FinancialSnapshot = {
  dailyRevenue: 142500,
  outstandingReceivables: 1250000,
  operationalExpenses: 85000,
  profitMargin: 40.3,
};

export const adminApi = {
  getDashboardSummary: async (filters: AdminFilters) => ({
    data: {
      kpis: mockKpis,
      bedOccupancy: mockBeds,
      departments: mockDepartments,
      alerts: mockAlerts,
      finance: mockFinance,
    } as AdminDashboardData,
    message: 'Success', status: 200,
  }),

  acknowledgeAlert: async (alertId: string) => ({ data: { success: true }, message: `Alert acknowledged`, status: 200 }),
  triggerBedDiversion: async (departmentId: string) => ({ data: { success: true }, message: `Bed diversion protocol activated for ${departmentId}`, status: 200 }),
};
