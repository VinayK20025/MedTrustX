import type {
  AdmissionSchedulerDashboardData, AdmissionSchedulerKPI, DoctorSchedule,
  TimeSlot, WaitlistEntry, BedUnit, ActiveAdmission, AdmissionFormData
} from '../types/admissionScheduler.types';

export interface AdmSchedulerFilters {
  mode?: 'scheduling' | 'admission';
  department?: string;
}

const mockKpis: AdmissionSchedulerKPI[] = [
  { id: '1', title: 'Appointments Today', value: 84, format: 'number', status: 'normal' },
  { id: '2', title: 'Admissions Today', value: 12, format: 'number', status: 'normal' },
  { id: '3', title: 'Beds Available', value: 38, format: 'number', status: 'success' },
  { id: '4', title: 'Waitlist Queue', value: 6, format: 'number', status: 'warning' },
];

const mkSlots = (booked: number[]): TimeSlot[] => {
  const hours = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45'];
  return hours.map((t, i) => ({
    id: `SL-${i}`,
    time: t,
    status: booked.includes(i) ? 'Booked' : i === 5 ? 'Tentative' : 'Available',
    patientName: booked.includes(i) ? ['Anita S.', 'Rajesh K.', 'Priya N.', 'David L.'][booked.indexOf(i) % 4] : undefined,
  }));
};

const mockSchedules: DoctorSchedule[] = [
  { doctorId: 'DOC-1', doctorName: 'Dr. Meera Iyer', department: 'Cardiology', slots: mkSlots([0, 3, 7, 9]) },
  { doctorId: 'DOC-2', doctorName: 'Dr. Sanjay Patel', department: 'Orthopedics', slots: mkSlots([1, 4, 8]) },
  { doctorId: 'DOC-3', doctorName: 'Dr. Emily Chen', department: 'Neurology', slots: mkSlots([2, 6, 10, 11]) },
];

const mockWaitlist: WaitlistEntry[] = [
  { id: 'WL-1', patientName: 'Arun Gupta', mrn: 'MRN-6601', preferredDoctor: 'Dr. Meera Iyer', preferredTime: '10:00 AM', priority: 'Urgent', addedAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'WL-2', patientName: 'Sunita Rao', mrn: 'MRN-7712', preferredDoctor: 'Dr. Sanjay Patel', preferredTime: 'Any', priority: 'Normal', addedAt: new Date(Date.now() - 3600000).toISOString() },
];

const mockBeds: BedUnit[] = [
  { id: 'BED-ICU-01', label: 'ICU-01', ward: 'ICU', status: 'Available', department: 'Cardiology' },
  { id: 'BED-ICU-02', label: 'ICU-02', ward: 'ICU', status: 'Occupied', department: 'Cardiology' },
  { id: 'BED-GW-11', label: 'GW-11', ward: 'General Ward', status: 'Available', department: 'General Medicine' },
  { id: 'BED-GW-12', label: 'GW-12', ward: 'General Ward', status: 'Cleaning', department: 'General Medicine' },
  { id: 'BED-PR-01', label: 'PR-01', ward: 'Private Room', status: 'Available', department: 'Orthopedics' },
  { id: 'BED-PR-02', label: 'PR-02', ward: 'Private Room', status: 'Reserved', department: 'Surgery' },
  { id: 'BED-SP-01', label: 'SP-01', ward: 'Semi-Private', status: 'Occupied', department: 'Neurology' },
  { id: 'BED-SP-02', label: 'SP-02', ward: 'Semi-Private', status: 'Available', department: 'Neurology' },
];

const mockAdmissions: ActiveAdmission[] = [
  { id: 'ADM-101', patientName: 'Vikram Singh', mrn: 'MRN-3301', department: 'Cardiology', bed: 'ICU-02', admittedAt: new Date(Date.now() - 86400000).toISOString(), attendingDoctor: 'Dr. Meera Iyer', status: 'Active' },
  { id: 'ADM-102', patientName: 'Maya Devi', mrn: 'MRN-4402', department: 'Neurology', bed: 'SP-01', admittedAt: new Date(Date.now() - 172800000).toISOString(), attendingDoctor: 'Dr. Emily Chen', status: 'Discharge Planned' },
];

export const admissionSchedulerApi = {
  getDashboardSummary: async (filters: AdmSchedulerFilters) => ({
    data: {
      kpis: mockKpis,
      doctorSchedules: mockSchedules,
      waitlist: mockWaitlist,
      beds: mockBeds,
      activeAdmissions: mockAdmissions,
    } as AdmissionSchedulerDashboardData,
    message: 'Success', status: 200,
  }),

  bookSlot: async (slotId: string, patientMrn: string) => ({ data: { success: true }, message: 'Appointment booked', status: 200 }),
  cancelSlot: async (slotId: string) => ({ data: { success: true }, message: 'Slot cancelled', status: 200 }),
  promoteWaitlist: async (waitlistId: string, slotId: string) => ({ data: { success: true }, message: 'Patient moved from waitlist to slot', status: 200 }),
  submitAdmission: async (form: AdmissionFormData) => ({ data: { success: true, admissionId: 'ADM-' + Math.floor(100 + Math.random() * 900) }, message: 'Patient admitted successfully', status: 200 }),
  allocateBed: async (bedId: string, patientMrn: string) => ({ data: { success: true }, message: 'Bed allocated', status: 200 }),
};
