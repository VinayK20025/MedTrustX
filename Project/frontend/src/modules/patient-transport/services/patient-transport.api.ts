import type { PatientTransportData } from '../types/patient-transport.types';

export interface PtFilters { status?: string; }

const mockData: PatientTransportData = {
  kpis: [
    { id: '1', label: 'Pending Transports', value: 3, status: 'warning' },
    { id: '2', label: 'Completed Today', value: 24, status: 'success' },
    { id: '3', label: 'Avg Transport Time', value: '8m', status: 'normal' },
    { id: '4', label: 'Urgent Pending', value: 1, status: 'critical' },
  ],
  tasks: [
    { id: 'TRN-881', patientName: 'John Smith', mrn: 'MRN-1029', fromLocation: 'Ward A - Bed 12', toLocation: 'Radiology (MRI)', equipment: 'Wheelchair', priority: 'Urgent', status: 'Pending', assignedAt: new Date(Date.now() - 600000).toISOString(), specialInstructions: 'Patient requires O2 cylinder during transport.' },
    { id: 'TRN-882', patientName: 'Maria Garcia', mrn: 'MRN-2041', fromLocation: 'ER Bay 4', toLocation: 'ICU - Bed 2', equipment: 'Stretcher', priority: 'Urgent', status: 'In Transit', assignedAt: new Date(Date.now() - 1200000).toISOString() },
    { id: 'TRN-883', patientName: 'Robert Chen', mrn: 'MRN-8842', fromLocation: 'Recovery Room', toLocation: 'Ward B - Bed 8', equipment: 'Bed', priority: 'Routine', status: 'Pending', assignedAt: new Date(Date.now() - 300000).toISOString() },
  ]
};

export const patientTransportApi = {
  getDashboardSummary: async (f: PtFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updateTaskStatus: async (taskId: string, status: string) => ({ data: { success: true }, message: 'Transport status updated', status: 200 }),
};
