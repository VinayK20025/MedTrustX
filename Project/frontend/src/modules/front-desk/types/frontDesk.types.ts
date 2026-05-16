/**
 * MedTrustX — Front Desk Executive / Receptionist (Role 73) Types
 */

export interface FrontDeskKPI {
  id: string;
  title: string;
  value: string | number;
  format?: 'number' | 'percentage' | 'text' | 'time';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface PatientRegistration {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idProof: string;
  mrn: string;
  registeredAt: string;
  isNew: boolean;
}

export interface AppointmentSlot {
  id: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'Available' | 'Booked' | 'Blocked';
  patientName?: string;
}

export interface QueueToken {
  id: string;
  tokenNumber: string;
  patientName: string;
  department: string;
  doctorName: string;
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Skipped';
  estimatedWait: string;
  createdAt: string;
}

export interface QuickBillItem {
  id: string;
  serviceName: string;
  category: 'Consultation' | 'Diagnostics' | 'Pharmacy' | 'Procedure';
  amount: number;
}

export interface FrontDeskDashboardData {
  kpis: FrontDeskKPI[];
  recentRegistrations: PatientRegistration[];
  todayAppointments: AppointmentSlot[];
  activeQueue: QueueToken[];
  billableServices: QuickBillItem[];
}
