/**
 * MedTrustX — HR Manager (Role 76) Types
 */

export interface HrKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'On Duty' | 'Off Duty' | 'On Leave' | 'Absent';
  licenseExpiry?: string;
  licenseStatus?: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface ShiftSlot {
  id: string;
  department: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  required: number;
  assigned: number;
  status: 'Fully Staffed' | 'Understaffed' | 'Critical';
  staff: string[];
}

export interface CredentialAlert {
  id: string;
  staffName: string;
  role: string;
  licenseType: string;
  expiryDate: string;
  daysRemaining: number;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface DepartmentStaffing {
  department: string;
  totalStaff: number;
  onDuty: number;
  required: number;
  status: 'Optimal' | 'Warning' | 'Critical';
}

export interface HrDashboardData {
  kpis: HrKPI[];
  staffDirectory: StaffMember[];
  shiftOverview: ShiftSlot[];
  credentialAlerts: CredentialAlert[];
  departmentStaffing: DepartmentStaffing[];
}
