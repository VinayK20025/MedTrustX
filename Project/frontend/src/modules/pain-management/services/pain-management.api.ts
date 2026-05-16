import type { PainData } from '../types/pain-management.types';

export interface PainFilters { status?: string; }

const mockData: PainData = {
  metrics: {
    patientsTreated: 15,
    proceduresDone: 5,
    avgPainReduction: 40,
    followUpsDue: 8,
  },
  patients: [
    { id: 'P-9921', name: 'John Doe', mrn: 'MRN-1011', age: 45, gender: 'M', primaryDiagnosis: 'Lumbar Radiculopathy', painType: 'Neuropathic', currentPainScore: 8, status: 'Active', lastAssessment: new Date(Date.now() - 3600000).toISOString() },
    { id: 'P-9922', name: 'Mary Smith', mrn: 'MRN-1012', age: 62, gender: 'F', primaryDiagnosis: 'Osteoarthritis', painType: 'Chronic', currentPainScore: 5, status: 'Stable', lastAssessment: new Date(Date.now() - 86400000).toISOString() },
    { id: 'P-9923', name: 'Robert Johnson', mrn: 'MRN-1013', age: 38, gender: 'M', primaryDiagnosis: 'Post-operative Pain', painType: 'Acute', currentPainScore: 7, status: 'Active', lastAssessment: new Date(Date.now() - 7200000).toISOString() },
  ],
  recentAssessments: [
    { id: 'A-001', patientId: 'P-9921', score: 8, scaleType: 'NRS', duration: '3 months', location: 'Lower Back, L Leg', characteristics: ['Burning', 'Tingling'], assessedAt: new Date(Date.now() - 3600000).toISOString(), notes: 'Pain exacerbates on walking.' },
    { id: 'A-002', patientId: 'P-9922', score: 5, scaleType: 'VAS', duration: '2 years', location: 'Bilateral Knees', characteristics: ['Aching', 'Stiffness'], assessedAt: new Date(Date.now() - 86400000).toISOString(), notes: 'Better in the evening.' },
  ],
  activePlans: [
    { id: 'TP-001', patientId: 'P-9921', medications: [{ name: 'Gabapentin', dosage: '300mg', frequency: 'TID' }, { name: 'Ibuprofen', dosage: '400mg', frequency: 'PRN' }], therapies: [{ type: 'Physiotherapy', frequency: 'Twice a week' }], startDate: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'Active' },
  ],
  procedures: [
    { id: 'PROC-001', patientId: 'P-9921', type: 'Epidural Steroid Injection', scheduledAt: new Date(Date.now() + 86400000).toISOString(), status: 'Scheduled' },
    { id: 'PROC-002', patientId: 'P-9923', type: 'Fascia Iliaca Block', scheduledAt: new Date(Date.now() - 3600000).toISOString(), status: 'Completed', outcome: 'Pain reduced from 7 to 2', performedBy: 'Dr. A. Sharma' },
  ]
};

export const painApi = {
  getDashboardData: async (f: PainFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  updatePainScore: async (patientId: string, score: number) => ({ data: { success: true }, message: 'Pain score updated', status: 200 }),
  scheduleProcedure: async (patientId: string, type: string, date: string) => ({ data: { success: true }, message: 'Procedure scheduled', status: 200 }),
};
