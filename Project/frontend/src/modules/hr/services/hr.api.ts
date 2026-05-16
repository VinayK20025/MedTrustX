import type {
  HrDashboardData, HrKPI, StaffMember, ShiftSlot,
  CredentialAlert, DepartmentStaffing
} from '../types/hr.types';

export interface HrFilters { department?: string; }

const mockKpis: HrKPI[] = [
  { id: '1', title: 'Total Staff', value: 412, format: 'number', status: 'normal' },
  { id: '2', title: 'On Duty Now', value: 210, format: 'number', status: 'success' },
  { id: '3', title: 'Absent Today', value: 8, format: 'number', status: 'warning' },
  { id: '4', title: 'Licenses Expiring', value: 5, format: 'number', status: 'critical' },
];

const mockStaff: StaffMember[] = [
  { id: 'S-1', name: 'Dr. Meera Iyer', role: 'Cardiologist', department: 'Cardiology', status: 'On Duty', licenseExpiry: new Date(Date.now() + 86400000 * 365).toISOString(), licenseStatus: 'Valid' },
  { id: 'S-2', name: 'Nurse Priya Nair', role: 'Staff Nurse', department: 'ICU', status: 'On Duty', licenseExpiry: new Date(Date.now() + 86400000 * 12).toISOString(), licenseStatus: 'Expiring Soon' },
  { id: 'S-3', name: 'Dr. Sanjay Patel', role: 'Orthopedic Surgeon', department: 'Orthopedics', status: 'On Leave' },
  { id: 'S-4', name: 'Ravi Kumar', role: 'Lab Technician', department: 'Pathology', status: 'Absent', licenseExpiry: new Date(Date.now() - 86400000 * 5).toISOString(), licenseStatus: 'Expired' },
];

const mockShifts: ShiftSlot[] = [
  { id: 'SH-1', department: 'ICU', shift: 'Morning', required: 8, assigned: 8, status: 'Fully Staffed', staff: ['Nurse Priya', 'Nurse Asha', 'Nurse Dev'] },
  { id: 'SH-2', department: 'ICU', shift: 'Night', required: 6, assigned: 4, status: 'Understaffed', staff: ['Nurse Lin', 'Nurse Roy'] },
  { id: 'SH-3', department: 'Emergency', shift: 'Morning', required: 10, assigned: 10, status: 'Fully Staffed', staff: [] },
  { id: 'SH-4', department: 'Emergency', shift: 'Night', required: 8, assigned: 5, status: 'Critical', staff: ['Nurse Kim'] },
];

const mockCredentials: CredentialAlert[] = [
  { id: 'CR-1', staffName: 'Nurse Priya Nair', role: 'Staff Nurse', licenseType: 'Nursing Council Registration', expiryDate: new Date(Date.now() + 86400000 * 12).toISOString(), daysRemaining: 12, severity: 'Warning' },
  { id: 'CR-2', staffName: 'Ravi Kumar', role: 'Lab Technician', licenseType: 'DMLT Certification', expiryDate: new Date(Date.now() - 86400000 * 5).toISOString(), daysRemaining: -5, severity: 'Critical' },
];

const mockDeptStaffing: DepartmentStaffing[] = [
  { department: 'ICU', totalStaff: 32, onDuty: 18, required: 20, status: 'Warning' },
  { department: 'Emergency', totalStaff: 45, onDuty: 28, required: 30, status: 'Warning' },
  { department: 'Cardiology', totalStaff: 20, onDuty: 12, required: 12, status: 'Optimal' },
  { department: 'Surgery', totalStaff: 38, onDuty: 22, required: 22, status: 'Optimal' },
];

export const hrApi = {
  getDashboardSummary: async (filters: HrFilters) => ({
    data: { kpis: mockKpis, staffDirectory: mockStaff, shiftOverview: mockShifts, credentialAlerts: mockCredentials, departmentStaffing: mockDeptStaffing } as HrDashboardData,
    message: 'Success', status: 200,
  }),
  approveLeave: async (staffId: string) => ({ data: { success: true }, message: 'Leave approved', status: 200 }),
  assignShift: async (staffId: string, shiftId: string) => ({ data: { success: true }, message: 'Staff assigned to shift', status: 200 }),
  sendCredentialReminder: async (alertId: string) => ({ data: { success: true }, message: 'Renewal reminder sent', status: 200 }),
};
