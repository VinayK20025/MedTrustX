import type {
  FrontDeskDashboardData, FrontDeskKPI, PatientRegistration,
  AppointmentSlot, QueueToken, QuickBillItem
} from '../types/frontDesk.types';

export interface FrontDeskFilters {
  department?: string;
  date?: string;
}

const mockKpis: FrontDeskKPI[] = [
  { id: '1', title: 'Patients Today', value: 128, format: 'number', status: 'normal' },
  { id: '2', title: 'Appointments Booked', value: 95, format: 'number', status: 'success' },
  { id: '3', title: 'Currently Waiting', value: 14, format: 'number', status: 'warning' },
  { id: '4', title: 'Avg Service Time', value: '1.8 min', format: 'time', status: 'success' },
];

const mockRegistrations: PatientRegistration[] = [
  { id: 'REG-501', name: 'Anita Sharma', phone: '9876****10', age: 34, gender: 'Female', idProof: 'Aadhaar', mrn: 'MRN-9901', registeredAt: new Date(Date.now() - 600000).toISOString(), isNew: true },
  { id: 'REG-502', name: 'Rajesh Kumar', phone: '9012****45', age: 52, gender: 'Male', idProof: 'PAN', mrn: 'MRN-4420', registeredAt: new Date(Date.now() - 1800000).toISOString(), isNew: false },
];

const mockAppointments: AppointmentSlot[] = [
  { id: 'APT-101', doctorName: 'Dr. Meera Iyer', department: 'Cardiology', date: new Date().toISOString(), time: '10:00 AM', status: 'Booked', patientName: 'Anita Sharma' },
  { id: 'APT-102', doctorName: 'Dr. Meera Iyer', department: 'Cardiology', date: new Date().toISOString(), time: '10:30 AM', status: 'Available' },
  { id: 'APT-103', doctorName: 'Dr. Sanjay Patel', department: 'Orthopedics', date: new Date().toISOString(), time: '11:00 AM', status: 'Booked', patientName: 'Rajesh Kumar' },
  { id: 'APT-104', doctorName: 'Dr. Sanjay Patel', department: 'Orthopedics', date: new Date().toISOString(), time: '11:30 AM', status: 'Available' },
  { id: 'APT-105', doctorName: 'Dr. Meera Iyer', department: 'Cardiology', date: new Date().toISOString(), time: '11:00 AM', status: 'Blocked' },
];

const mockQueue: QueueToken[] = [
  { id: 'Q-1', tokenNumber: 'A101', patientName: 'Anita Sharma', department: 'Cardiology', doctorName: 'Dr. Meera Iyer', status: 'In Progress', estimatedWait: '0 min', createdAt: new Date(Date.now() - 1200000).toISOString() },
  { id: 'Q-2', tokenNumber: 'A102', patientName: 'Vikram Singh', department: 'General Medicine', doctorName: 'Dr. Arjun Das', status: 'Waiting', estimatedWait: '8 min', createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'Q-3', tokenNumber: 'A103', patientName: 'Priya Nair', department: 'Dermatology', doctorName: 'Dr. Lisa Menon', status: 'Waiting', estimatedWait: '15 min', createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'Q-4', tokenNumber: 'B201', patientName: 'Rajesh Kumar', department: 'Orthopedics', doctorName: 'Dr. Sanjay Patel', status: 'Waiting', estimatedWait: '22 min', createdAt: new Date(Date.now() - 120000).toISOString() },
];

const mockBillable: QuickBillItem[] = [
  { id: 'SVC-1', serviceName: 'OPD Consultation', category: 'Consultation', amount: 500 },
  { id: 'SVC-2', serviceName: 'X-Ray (Single)', category: 'Diagnostics', amount: 350 },
  { id: 'SVC-3', serviceName: 'CBC Blood Test', category: 'Diagnostics', amount: 250 },
  { id: 'SVC-4', serviceName: 'ECG', category: 'Procedure', amount: 400 },
];

export const frontDeskApi = {
  getDashboardSummary: async (filters: FrontDeskFilters) => ({
    data: {
      kpis: mockKpis,
      recentRegistrations: mockRegistrations,
      todayAppointments: mockAppointments,
      activeQueue: mockQueue,
      billableServices: mockBillable,
    } as FrontDeskDashboardData,
    message: 'Success', status: 200,
  }),

  registerPatient: async (patient: Partial<PatientRegistration>) => ({ data: { success: true, mrn: 'MRN-' + Math.floor(Math.random() * 9999) }, message: 'Patient registered successfully', status: 200 }),
  bookAppointment: async (slotId: string, patientMrn: string) => ({ data: { success: true }, message: 'Appointment booked', status: 200 }),
  generateToken: async (patientMrn: string, department: string) => ({ data: { success: true, token: 'A' + Math.floor(100 + Math.random() * 900) }, message: 'Token generated', status: 200 }),
  callNextToken: async (department: string) => ({ data: { success: true }, message: 'Next patient called', status: 200 }),
  skipToken: async (tokenId: string) => ({ data: { success: true }, message: 'Token skipped', status: 200 }),
};
