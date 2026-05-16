import type {
  HrExecDashboardData, HrExecKPI, HrTask, LeaveRequest,
  AttendanceEntry, DocumentVerification
} from '../types/hrExec.types';

export interface HrExecFilters { category?: string; }

const mockKpis: HrExecKPI[] = [
  { id: '1', title: 'Tasks Today', value: 51, format: 'number', status: 'normal' },
  { id: '2', title: 'Completed', value: 45, format: 'number', status: 'success' },
  { id: '3', title: 'Pending', value: 6, format: 'number', status: 'warning' },
  { id: '4', title: 'Avg Task Time', value: '2.8 min', format: 'text', status: 'success' },
];

const mockTasks: HrTask[] = [
  { id: 'T-1', title: 'Approve leave — Nurse Priya Nair', category: 'Leave', priority: 'Urgent', status: 'Pending', assignedAt: new Date(Date.now() - 3600000).toISOString(), relatedStaff: 'Nurse Priya Nair' },
  { id: 'T-2', title: 'Verify DMLT certificate — Ravi Kumar', category: 'Document', priority: 'Urgent', status: 'Pending', assignedAt: new Date(Date.now() - 7200000).toISOString(), relatedStaff: 'Ravi Kumar' },
  { id: 'T-3', title: 'Correct attendance — Dr. Sanjay Patel', category: 'Attendance', priority: 'Normal', status: 'In Progress', assignedAt: new Date(Date.now() - 1800000).toISOString(), relatedStaff: 'Dr. Sanjay Patel' },
  { id: 'T-4', title: 'Update address — Maya Devi', category: 'Record', priority: 'Low', status: 'Completed', assignedAt: new Date(Date.now() - 14400000).toISOString(), relatedStaff: 'Maya Devi' },
  { id: 'T-5', title: 'Schedule interview — Lab Tech candidate', category: 'Recruitment', priority: 'Normal', status: 'Overdue', assignedAt: new Date(Date.now() - 86400000).toISOString(), dueBy: new Date(Date.now() - 3600000).toISOString() },
];

const mockLeaves: LeaveRequest[] = [
  { id: 'LV-1', staffName: 'Nurse Priya Nair', role: 'Staff Nurse', department: 'ICU', leaveType: 'Sick', fromDate: new Date(Date.now() + 86400000).toISOString(), toDate: new Date(Date.now() + 86400000 * 3).toISOString(), days: 3, reason: 'Fever and body ache', status: 'Pending', hasShiftConflict: true },
  { id: 'LV-2', staffName: 'Arun Gupta', role: 'Ward Boy', department: 'General Ward', leaveType: 'Casual', fromDate: new Date(Date.now() + 86400000 * 5).toISOString(), toDate: new Date(Date.now() + 86400000 * 6).toISOString(), days: 2, reason: 'Family function', status: 'Pending', hasShiftConflict: false },
];

const mockAttendance: AttendanceEntry[] = [
  { id: 'AT-1', staffName: 'Dr. Meera Iyer', department: 'Cardiology', checkIn: '08:55', checkOut: '17:10', status: 'Present', needsCorrection: false },
  { id: 'AT-2', staffName: 'Nurse Asha', department: 'ICU', checkIn: '09:22', status: 'Late', needsCorrection: false },
  { id: 'AT-3', staffName: 'Dr. Sanjay Patel', department: 'Orthopedics', checkIn: '—', status: 'Absent', needsCorrection: true },
  { id: 'AT-4', staffName: 'Ravi Kumar', department: 'Pathology', checkIn: '08:50', checkOut: '13:00', status: 'Half Day', needsCorrection: true },
];

const mockDocs: DocumentVerification[] = [
  { id: 'DV-1', staffName: 'Ravi Kumar', documentName: 'DMLT Certificate', documentType: 'Certificate', uploadedAt: new Date(Date.now() - 172800000).toISOString(), status: 'Pending' },
  { id: 'DV-2', staffName: 'Nurse Priya Nair', documentName: 'Nursing Council Reg.', documentType: 'License', uploadedAt: new Date(Date.now() - 86400000).toISOString(), status: 'Verified' },
  { id: 'DV-3', staffName: 'New Hire — Sunita R.', documentName: 'Aadhaar Card', documentType: 'ID Proof', uploadedAt: new Date(Date.now() - 3600000).toISOString(), status: 'Pending' },
];

export const hrExecApi = {
  getDashboardSummary: async (filters: HrExecFilters) => ({
    data: { kpis: mockKpis, tasks: mockTasks, leaveRequests: mockLeaves, attendance: mockAttendance, documents: mockDocs } as HrExecDashboardData,
    message: 'Success', status: 200,
  }),
  completeTask: async (taskId: string) => ({ data: { success: true }, message: 'Task completed', status: 200 }),
  approveLeave: async (leaveId: string) => ({ data: { success: true }, message: 'Leave approved', status: 200 }),
  rejectLeave: async (leaveId: string) => ({ data: { success: true }, message: 'Leave rejected', status: 200 }),
  correctAttendance: async (entryId: string, checkIn: string, checkOut: string) => ({ data: { success: true }, message: 'Attendance corrected', status: 200 }),
  verifyDocument: async (docId: string, decision: 'Verified' | 'Rejected') => ({ data: { success: true }, message: `Document ${decision.toLowerCase()}`, status: 200 }),
};
