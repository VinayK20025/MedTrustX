import type {
  DischargeDashboardData, DischargeKPI, DischargePatient,
  DischargeClearance, DischargeBillingSummary, DischargeDocument
} from '../types/discharge.types';

export interface DischargeFilters {
  ward?: string;
  status?: string;
}

const mkClearances = (done: number[]): DischargeClearance[] => {
  const depts: DischargeClearance['department'][] = ['Doctor', 'Nursing', 'Pharmacy', 'Billing', 'Documentation', 'Final Approval'];
  return depts.map((d, i) => ({
    department: d,
    status: done.includes(i) ? 'Cleared' : i === done.length ? 'In Progress' : i > done.length ? 'Pending' : 'Pending',
    clearedBy: done.includes(i) ? 'Auto' : undefined,
    clearedAt: done.includes(i) ? new Date().toISOString() : undefined,
    blockerReason: d === 'Billing' && !done.includes(3) ? 'Outstanding ₹5,200 pending' : undefined,
  }));
};

const mockKpis: DischargeKPI[] = [
  { id: '1', title: 'Discharges Today', value: 32, format: 'number', status: 'normal' },
  { id: '2', title: 'Avg Discharge Time', value: '2.5 hrs', format: 'time', status: 'success' },
  { id: '3', title: 'Delayed (>4 hrs)', value: 4, format: 'number', status: 'critical' },
  { id: '4', title: 'Pending Now', value: 9, format: 'number', status: 'warning' },
];

const mockPatients: DischargePatient[] = [
  { id: 'DC-101', patientName: 'Vikram Singh', mrn: 'MRN-3301', ward: 'ICU', bed: 'ICU-02', attendingDoctor: 'Dr. Meera Iyer', admittedAt: new Date(Date.now() - 432000000).toISOString(), dischargeInitiatedAt: new Date(Date.now() - 7200000).toISOString(), overallProgress: 50, status: 'In Progress', clearances: mkClearances([0, 1, 2]) },
  { id: 'DC-102', patientName: 'Maya Devi', mrn: 'MRN-4402', ward: 'Neuro Ward', bed: 'NW-08', attendingDoctor: 'Dr. Emily Chen', admittedAt: new Date(Date.now() - 259200000).toISOString(), dischargeInitiatedAt: new Date(Date.now() - 14400000).toISOString(), overallProgress: 83, status: 'Delayed', clearances: mkClearances([0, 1, 2, 3, 4]) },
  { id: 'DC-103', patientName: 'Rajesh Kumar', mrn: 'MRN-5503', ward: 'Ortho Ward', bed: 'OW-12', attendingDoctor: 'Dr. Sanjay Patel', admittedAt: new Date(Date.now() - 172800000).toISOString(), dischargeInitiatedAt: new Date(Date.now() - 1800000).toISOString(), overallProgress: 17, status: 'Pending', clearances: mkClearances([0]) },
];

const mockBilling: DischargeBillingSummary = { totalCharges: 142500, insuranceCovered: 120000, patientPaid: 17300, outstanding: 5200, status: 'Partial' };

const mockDocs: DischargeDocument[] = [
  { id: 'DOC-1', name: 'Discharge Summary', type: 'Discharge Summary', status: 'Ready' },
  { id: 'DOC-2', name: 'Medication Prescription', type: 'Prescription', status: 'Ready' },
  { id: 'DOC-3', name: 'Final Lab Panel', type: 'Lab Report', status: 'Missing' },
  { id: 'DOC-4', name: 'Chest X-Ray Report', type: 'Imaging Report', status: 'Ready' },
];

export const dischargeApi = {
  getDashboardSummary: async (filters: DischargeFilters) => ({
    data: { kpis: mockKpis, patients: mockPatients, billing: mockBilling, documents: mockDocs } as DischargeDashboardData,
    message: 'Success', status: 200,
  }),
  requestClearance: async (patientId: string, department: string) => ({ data: { success: true }, message: `Clearance requested from ${department}`, status: 200 }),
  confirmDischarge: async (patientId: string) => ({ data: { success: true }, message: 'Patient discharged successfully', status: 200 }),
  escalateDelay: async (patientId: string) => ({ data: { success: true }, message: 'Delay escalated to administration', status: 200 }),
};
