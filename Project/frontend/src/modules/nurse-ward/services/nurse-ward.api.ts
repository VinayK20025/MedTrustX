import type { NurseWardData } from '../types/nurse-ward.types';

export interface NwFilters { patientId?: string; }

const mockData: NurseWardData = {
  kpis: [
    { id: '1', label: 'Assigned Patients', value: 8, status: 'normal' },
    { id: '2', label: 'Pending Meds', value: 4, status: 'warning' },
    { id: '3', label: 'Critical Alerts', value: 1, status: 'critical' },
    { id: '4', label: 'Tasks Completed', value: 24, status: 'success' },
  ],
  patients: [
    { id: 'PAT-101', mrn: 'MRN-88219', name: 'James Wilson', bed: 'Ward A - Bed 12', age: 64, gender: 'M', diagnosis: 'Post-op CABG', status: 'Observation', allergies: ['Penicillin'] },
    { id: 'PAT-102', mrn: 'MRN-99320', name: 'Sarah Jenkins', bed: 'Ward A - Bed 14', age: 45, gender: 'F', diagnosis: 'Pneumonia', status: 'Stable' },
    { id: 'PAT-103', mrn: 'MRN-77411', name: 'Robert Chen', bed: 'Ward A - Bed 15', age: 72, gender: 'M', diagnosis: 'Sepsis Protocol', status: 'Critical' },
  ],
  medications: [
    { id: 'MED-1', patientId: 'PAT-101', drug: 'Amiodarone', dosage: '150mg', route: 'IV', scheduledTime: new Date(Date.now() + 1800000).toISOString(), status: 'Pending' },
    { id: 'MED-2', patientId: 'PAT-102', drug: 'Ceftriaxone', dosage: '1g', route: 'IV Push', scheduledTime: new Date(Date.now() - 3600000).toISOString(), status: 'Missed' },
    { id: 'MED-3', patientId: 'PAT-103', drug: 'Norepinephrine', dosage: '4mcg/min', route: 'IV Infusion', scheduledTime: new Date(Date.now() + 3600000).toISOString(), status: 'Pending' },
  ],
  tasks: [
    { id: 'TSK-1', patientId: 'PAT-101', task: 'Surgical Dressing Change', priority: 'High', status: 'Pending', timeframe: 'Morning Shift' },
    { id: 'TSK-2', patientId: 'PAT-102', task: 'Incentive Spirometry', priority: 'Normal', status: 'Pending', timeframe: 'Q4H' },
    { id: 'TSK-3', patientId: 'PAT-103', task: 'Hourly Urine Output Monitoring', priority: 'High', status: 'Pending', timeframe: 'Continuous' },
  ],
  vitals: [
    { id: 'VIT-1', patientId: 'PAT-101', bp: '118/76', hr: 82, temp: 98.6, spo2: 96, recordedAt: new Date(Date.now() - 7200000).toISOString(), isAbnormal: false },
    { id: 'VIT-2', patientId: 'PAT-103', bp: '88/50', hr: 115, temp: 101.2, spo2: 92, recordedAt: new Date(Date.now() - 1800000).toISOString(), isAbnormal: true },
  ],
  alerts: [
    { id: 'ALR-1', patientId: 'PAT-103', patientName: 'Robert Chen', bed: 'Bed 15', type: 'Vitals Critical', message: 'Hypotension (88/50) & Tachycardia (115 BPM)', timestamp: new Date(Date.now() - 600000).toISOString() },
    { id: 'ALR-2', patientId: 'PAT-102', patientName: 'Sarah Jenkins', bed: 'Bed 14', type: 'Medication Overdue', message: 'Ceftriaxone 1g IV is 1 hour overdue.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  ]
};

export const nurseWardApi = {
  getDashboardSummary: async (f: NwFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  administerMed: async (medId: string) => ({ data: { success: true }, message: 'Medication administered and charted', status: 200 }),
  completeTask: async (taskId: string) => ({ data: { success: true }, message: 'Task marked complete', status: 200 }),
  recordVitals: async (patientId: string, payload: any) => ({ data: { success: true }, message: 'Vitals recorded', status: 200 }),
};
