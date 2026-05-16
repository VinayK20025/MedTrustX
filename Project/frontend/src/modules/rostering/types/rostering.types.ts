/**
 * MedTrustX — Rostering Service Types
 */

export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'On-Call' | 'General';
export type StaffRole = 'Doctor' | 'Nurse' | 'Technician' | 'Admin';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  department: string;
  specialty?: string;
  contactNumber: string;
}

export interface ShiftEntry {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  department: string;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  startDate: string;
  endDate: string;
  type: 'Sick' | 'Annual' | 'Compassionate' | 'Maternity/Paternity';
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface RosteringMetrics {
  totalStaffOnDuty: number;
  openShiftsCount: number;
  overtimeHoursTotal: number;
  absenteeismRatePercent: number;
  upcomingLeavesCount: number;
}

export interface RosteringDashboardData {
  metrics: RosteringMetrics;
  currentShifts: ShiftEntry[];
  pendingLeaveRequests: LeaveRequest[];
  departmentalCoverage: { department: string; coveragePercent: number }[];
}
