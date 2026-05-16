import { apiGet, apiPost } from '@/services/api';
import type { RosteringDashboardData, ShiftEntry, LeaveRequest } from '../types/rostering.types';

const d = (hours: number) => new Date(Date.now() + hours * 3600000).toISOString();
const t = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const mockShifts: ShiftEntry[] = [
  { id: 'SHFT-101', staffId: 'DOC-001', staffName: 'Dr. Sarah Connor', date: d(0), type: 'Morning', startTime: '08:00', endTime: '16:00', department: 'Emergency' },
  { id: 'SHFT-102', staffId: 'NUR-015', staffName: 'Nurse James Miller', date: d(0), type: 'Evening', startTime: '16:00', endTime: '00:00', department: 'ICU' },
  { id: 'SHFT-103', staffId: 'DOC-009', staffName: 'Dr. Kevin Hart', date: d(0), type: 'Night', startTime: '00:00', endTime: '08:00', department: 'Surgery' },
];

const mockLeaves: LeaveRequest[] = [
  { id: 'LV-501', staffId: 'NUR-022', staffName: 'Emily Blunt', startDate: t(-2), endDate: t(-5), type: 'Annual', status: 'Pending' },
  { id: 'LV-502', staffId: 'DOC-012', staffName: 'Robert Downey', startDate: t(-1), endDate: t(-3), type: 'Sick', status: 'Approved' },
];

const mockData: RosteringDashboardData = {
  metrics: {
    totalStaffOnDuty: 124,
    openShiftsCount: 5,
    overtimeHoursTotal: 84,
    absenteeismRatePercent: 3.2,
    upcomingLeavesCount: 12
  },
  currentShifts: mockShifts,
  pendingLeaveRequests: mockLeaves,
  departmentalCoverage: [
    { department: 'Emergency', coveragePercent: 95 },
    { department: 'ICU', coveragePercent: 100 },
    { department: 'Radiology', coveragePercent: 88 },
    { department: 'Surgery', coveragePercent: 92 },
  ]
};

export const rosteringApi = {
  getDashboardData: async (): Promise<{ data: RosteringDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: RosteringDashboardData }>('/api/v1/rostering/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  updateShift: async (shiftId: string, updates: Partial<ShiftEntry>) => {
    try {
      return await apiPost(`/api/v1/rostering/shifts/${shiftId}`, updates);
    } catch {
      return { data: { success: true }, message: 'Shift updated (Mock)', status: 200 };
    }
  }
};
