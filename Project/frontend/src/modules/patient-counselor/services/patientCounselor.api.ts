import type {
  PatientCounselorDashboardData, CounselorKPI, CounseledPatient,
  CounselingSession, TreatmentExplanation, FinancialEstimate
} from '../types/patientCounselor.types';

export interface CounselorFilters {
  status?: string;
}

const mockKpis: CounselorKPI[] = [
  { id: '1', title: 'Sessions Today', value: 8, format: 'number', status: 'success' },
  { id: '2', title: 'Pending Decisions', value: 3, format: 'number', status: 'warning', actionLabel: 'Follow Up', actionUrl: '/dashboard/patient-counselor/followup' },
  { id: '3', title: 'Avg Session Time', value: '25m', format: 'text', status: 'normal' },
  { id: '4', title: 'Satisfaction Score', value: '98%', format: 'text', status: 'success' },
];

const mockPatients: CounseledPatient[] = [
  { id: 'PT-CS-1', patientName: 'Maria Rodriguez', mrn: 'MRN-5542', diagnosis: 'Cholelithiasis (Gallstones)', physician: 'Dr. Evans', status: 'Waiting', appointmentTime: new Date(Date.now() - 600000).toISOString() },
  { id: 'PT-CS-2', patientName: 'David Chen', mrn: 'MRN-8812', diagnosis: 'Osteoarthritis (Knee)', physician: 'Dr. Smith', status: 'Decision Pending', appointmentTime: new Date(Date.now() - 86400000).toISOString() },
];

const mockTreatment: TreatmentExplanation = {
  id: 'TX-101',
  title: 'Laparoscopic Cholecystectomy',
  plainLanguageSummary: 'A minimally invasive surgery to remove your gallbladder using small incisions and a camera. This will stop the pain caused by your gallstones.',
  duration: '1-2 hours',
  successRate: '99%',
  risks: ['Minor infection', 'Bile leak (rare)'],
  alternatives: ['Dietary changes (temporary relief)', 'Medication to dissolve stones (often ineffective)'],
};

const mockEstimate: FinancialEstimate = {
  id: 'FIN-101',
  procedureName: 'Laparoscopic Cholecystectomy',
  grossCost: 15000,
  insuranceCoverage: 12000,
  patientOut_of_Pocket: 3000,
  paymentOptions: ['Lump sum discount (10%)', '12-month interest-free plan'],
  isApprovedByPayer: true,
};

const mockSession: CounselingSession = {
  id: 'SESS-101',
  patientId: 'MRN-5542',
  talkingPoints: [
    { id: 'TP-1', topic: 'Diagnosis', content: 'Explain gallstone formation and why it causes pain after eating.', discussed: true },
    { id: 'TP-2', topic: 'Treatment', content: 'Review laparoscopic procedure and recovery time.', discussed: false },
    { id: 'TP-3', topic: 'Cost', content: 'Review out-of-pocket maximums and payment plans.', discussed: false },
  ],
  notes: '',
  patientConcerns: ['Afraid of general anesthesia', 'Worried about dietary restrictions post-surgery'],
};

export const patientCounselorApi = {
  getDashboardSummary: async (filters: CounselorFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      activeSession: mockSession,
      activeTreatment: mockTreatment,
      activeEstimate: mockEstimate,
    } as PatientCounselorDashboardData,
    message: 'Success', status: 200,
  }),

  markPointDiscussed: async (sessionId: string, pointId: string) => ({ data: { success: true }, message: `Talking point marked as discussed`, status: 200 }),
  saveSessionNotes: async (sessionId: string, notes: string) => ({ data: { success: true }, message: `Session notes saved`, status: 200 }),
  completeCounseling: async (patientId: string) => ({ data: { success: true }, message: `Patient marked as counseled`, status: 200 }),
};
