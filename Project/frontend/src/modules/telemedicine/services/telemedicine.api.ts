import type { TelmedData } from '../types/telemedicine.types';

export interface TmFilters { status?: string; }

const mockData: TelmedData = {
  kpis: [
    { id: '1', label: 'Consultations Today', value: 18, status: 'success' },
    { id: '2', label: 'In Queue', value: 4, status: 'warning' },
    { id: '3', label: 'Avg Duration', value: '9m', status: 'success' },
    { id: '4', label: 'Patient Satisfaction', value: '4.7/5', status: 'success' },
  ],
  queue: [
    { id: 'TM-01', name: 'Priya Sharma', age: 34, gender: 'F', complaint: 'Persistent cough and mild fever (3 days)', status: 'In Consult', scheduledTime: new Date(Date.now() - 300000).toISOString(), allergies: ['Penicillin'], connectionQuality: 'Good' },
    { id: 'TM-02', name: 'Rajesh Iyer', age: 52, gender: 'M', complaint: 'Follow-up: Diabetes management', status: 'Waiting', scheduledTime: new Date(Date.now() + 600000).toISOString(), connectionQuality: 'Good' },
    { id: 'TM-03', name: 'Maria Santos', age: 28, gender: 'F', complaint: 'Skin rash on forearms', status: 'Waiting', scheduledTime: new Date(Date.now() + 1800000).toISOString(), connectionQuality: 'Fair' },
    { id: 'TM-04', name: 'Ahmed Hassan', age: 67, gender: 'M', complaint: 'Knee pain post-physiotherapy', status: 'Waiting', scheduledTime: new Date(Date.now() + 3600000).toISOString(), allergies: ['Sulfa drugs'], connectionQuality: 'Poor' },
  ],
  templates: [
    { id: 'rx1', drug: 'Amoxicillin 500mg', dose: '500mg', frequency: 'TDS', duration: '5 days' },
    { id: 'rx2', drug: 'Paracetamol 650mg', dose: '650mg', frequency: 'SOS', duration: '3 days' },
    { id: 'rx3', drug: 'Cetirizine 10mg', dose: '10mg', frequency: 'OD (HS)', duration: '7 days' },
  ]
};

export const telemedicineApi = {
  getDashboardSummary: async (f: TmFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  startConsultation: async (patientId: string) => ({ data: { success: true }, message: 'Video call initiated', status: 200 }),
  endConsultation: async (patientId: string) => ({ data: { success: true }, message: 'Consultation completed', status: 200 }),
  sendPrescription: async (patientId: string, items: any[]) => ({ data: { success: true }, message: 'E-Prescription sent to patient & pharmacy', status: 200 }),
};
