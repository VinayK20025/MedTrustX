/**
 * MedTrustX — HR Executive (Role 77) Types
 */

export interface HrExecKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface HrTask {
  id: string;
  title: string;
  category: 'Leave' | 'Attendance' | 'Document' | 'Record' | 'Recruitment';
  priority: 'Urgent' | 'Normal' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  assignedAt: string;
  dueBy?: string;
  relatedStaff?: string;
}

export interface LeaveRequest {
  id: string;
  staffName: string;
  role: string;
  department: string;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Maternity';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  hasShiftConflict: boolean;
}

export interface AttendanceEntry {
  id: string;
  staffName: string;
  department: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day';
  needsCorrection: boolean;
}

export interface DocumentVerification {
  id: string;
  staffName: string;
  documentName: string;
  documentType: 'License' | 'Certificate' | 'ID Proof' | 'Degree';
  uploadedAt: string;
  status: 'Verified' | 'Pending' | 'Rejected';
}

export interface HrExecDashboardData {
  kpis: HrExecKPI[];
  tasks: HrTask[];
  leaveRequests: LeaveRequest[];
  attendance: AttendanceEntry[];
  documents: DocumentVerification[];
}
