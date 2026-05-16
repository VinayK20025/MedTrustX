import type {
  TrainingDashboardData, TrainingKPI, TrainingProgram,
  TrainingSession, StaffTrainingRecord, CertificationAlert
} from '../types/training.types';

export interface TrainingFilters { department?: string; type?: string; }

const mockKpis: TrainingKPI[] = [
  { id: '1', title: 'Completion Rate', value: '87%', format: 'text', status: 'success' },
  { id: '2', title: 'Sessions This Week', value: 5, format: 'number', status: 'normal' },
  { id: '3', title: 'Staff Trained (MTD)', value: 120, format: 'number', status: 'success' },
  { id: '4', title: 'Certs Expiring', value: 8, format: 'number', status: 'critical' },
];

const mockPrograms: TrainingProgram[] = [
  { id: 'TP-1', name: 'Basic Life Support (BLS)', type: 'Mandatory', category: 'Clinical', durationHours: 8, enrolledCount: 45, completedCount: 38, status: 'Active' },
  { id: 'TP-2', name: 'Infection Control & Prevention', type: 'Mandatory', category: 'Safety', durationHours: 4, enrolledCount: 120, completedCount: 110, status: 'Active' },
  { id: 'TP-3', name: 'Advanced Cardiac Life Support', type: 'Mandatory', category: 'Clinical', durationHours: 16, enrolledCount: 22, completedCount: 12, status: 'Active' },
  { id: 'TP-4', name: 'New Employee Orientation', type: 'Onboarding', category: 'Soft Skills', durationHours: 6, enrolledCount: 8, completedCount: 5, status: 'Scheduled' },
];

const mockSessions: TrainingSession[] = [
  { id: 'TS-1', programName: 'BLS Refresher', date: new Date(Date.now() + 86400000).toISOString(), time: '10:00 AM', trainer: 'Dr. Arjun Das', location: 'Seminar Hall A', capacity: 30, enrolled: 28, status: 'Upcoming' },
  { id: 'TS-2', programName: 'Infection Control', date: new Date(Date.now() + 86400000 * 2).toISOString(), time: '02:00 PM', trainer: 'Ms. Kavitha R.', location: 'Training Room 3', capacity: 40, enrolled: 35, status: 'Upcoming' },
  { id: 'TS-3', programName: 'Fire Safety Drill', date: new Date().toISOString(), time: '04:00 PM', trainer: 'Safety Officer', location: 'Assembly Point', capacity: 50, enrolled: 50, status: 'In Progress' },
];

const mockRecords: StaffTrainingRecord[] = [
  { id: 'SR-1', staffName: 'Nurse Priya Nair', role: 'Staff Nurse', department: 'ICU', courseName: 'BLS', status: 'Completed', completedAt: new Date(Date.now() - 86400000 * 60).toISOString(), certExpiry: new Date(Date.now() + 86400000 * 15).toISOString(), certDaysRemaining: 15 },
  { id: 'SR-2', staffName: 'Ravi Kumar', role: 'Lab Technician', department: 'Pathology', courseName: 'Infection Control', status: 'Overdue', certDaysRemaining: -10 },
  { id: 'SR-3', staffName: 'Dr. Sanjay Patel', role: 'Surgeon', department: 'Orthopedics', courseName: 'ACLS', status: 'In Progress' },
  { id: 'SR-4', staffName: 'Sunita Rao', role: 'New Hire', department: 'General Ward', courseName: 'Orientation', status: 'Not Started' },
];

const mockCerts: CertificationAlert[] = [
  { id: 'CA-1', staffName: 'Nurse Priya Nair', role: 'Staff Nurse', certification: 'BLS Certification', expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(), daysRemaining: 15, severity: 'Warning' },
  { id: 'CA-2', staffName: 'Ravi Kumar', role: 'Lab Technician', certification: 'Infection Control Cert.', expiryDate: new Date(Date.now() - 86400000 * 10).toISOString(), daysRemaining: -10, severity: 'Critical' },
  { id: 'CA-3', staffName: 'Nurse Asha', role: 'Staff Nurse', certification: 'ACLS Certification', expiryDate: new Date(Date.now() + 86400000 * 45).toISOString(), daysRemaining: 45, severity: 'Info' },
];

export const trainingApi = {
  getDashboardSummary: async (filters: TrainingFilters) => ({
    data: { kpis: mockKpis, programs: mockPrograms, upcomingSessions: mockSessions, staffRecords: mockRecords, certAlerts: mockCerts } as TrainingDashboardData,
    message: 'Success', status: 200,
  }),
  assignTraining: async (programId: string, staffIds: string[]) => ({ data: { success: true }, message: `${staffIds.length} staff assigned`, status: 200 }),
  sendReminder: async (alertId: string) => ({ data: { success: true }, message: 'Reminder sent', status: 200 }),
  markAttendance: async (sessionId: string, staffId: string, present: boolean) => ({ data: { success: true }, message: 'Attendance marked', status: 200 }),
};
