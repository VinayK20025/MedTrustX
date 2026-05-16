import type {
  CoderDashboardData, CoderKPI, CoderCase,
  ClinicalContext, NlpSuggestion, ActiveCodingState
} from '../types/coder.types';

export interface CoderFilters {
  priority?: string;
  type?: string;
}

const mockKpis: CoderKPI[] = [
  { id: '1', title: 'Charts Coded', value: 42, format: 'number', status: 'normal' },
  { id: '2', title: 'Accuracy Rate', value: '99.1%', format: 'text', status: 'success' },
  { id: '3', title: 'Validation Errors', value: 3, format: 'number', status: 'critical' },
  { id: '4', title: 'Charts/Hour', value: 12.5, format: 'number', status: 'success' },
];

const mockQueue: CoderCase[] = [
  { id: 'CASE-101', patientName: 'John Doe', encounterType: 'IPD', priority: 'High', status: 'In Progress', dueDate: new Date(Date.now() + 7200000).toISOString() },
  { id: 'CASE-102', patientName: 'Mary Smith', encounterType: 'OPD', priority: 'Med', status: 'Unassigned', dueDate: new Date(Date.now() + 86400000).toISOString() },
  { id: 'CASE-103', patientName: 'David Lee', encounterType: 'ER', priority: 'Urgent', status: 'Validation Error', dueDate: new Date(Date.now() - 3600000).toISOString() },
];

const mockContext: ClinicalContext = {
  caseId: 'CASE-101',
  patientHeader: { name: 'John Doe', mrn: 'MRN-8812', dob: '1965-04-12', admitDate: new Date(Date.now() - 172800000).toISOString() },
  notes: {
    hpi: 'Patient presented to ER with acute retrosternal chest pain radiating to left arm. ST elevation noted on ECG.',
    diagnosis: 'Acute ST elevation myocardial infarction (STEMI) of anterolateral wall.',
    procedures: 'Emergent left heart catheterization and placement of drug-eluting stent in LAD.',
  },
  nlpHighlights: [
    { text: 'Acute ST elevation myocardial infarction (STEMI)', type: 'diagnosis' },
    { text: 'anterolateral wall', type: 'diagnosis' },
    { text: 'left heart catheterization', type: 'procedure' },
    { text: 'drug-eluting stent in LAD', type: 'procedure' },
  ]
};

const mockSuggestions: NlpSuggestion[] = [
  { code: 'I21.09', description: 'STEMI involving other coronary artery of anterior wall', confidence: 95, type: 'ICD-10' },
  { code: '93458', description: 'Left heart catheterization with coronary angiography', confidence: 98, type: 'CPT' },
  { code: '92928', description: 'Percutaneous transcatheter placement of intracoronary stent(s)', confidence: 92, type: 'CPT' },
];

const mockCoding: ActiveCodingState = {
  caseId: 'CASE-101',
  selectedICD: [
    { code: 'I21.09', description: 'STEMI involving anterior wall', primary: true }
  ],
  selectedCPT: [],
  validationErrors: ['Missing procedure code for drug-eluting stent.']
};

export const coderApi = {
  getDashboardSummary: async (filters: CoderFilters) => ({
    data: {
      kpis: mockKpis,
      queue: mockQueue,
      activeContext: mockContext,
      suggestions: mockSuggestions,
      activeCoding: mockCoding,
    } as CoderDashboardData,
    message: 'Success', status: 200,
  }),

  addCode: async (caseId: string, type: 'ICD-10' | 'CPT', code: string) => ({ data: { success: true }, message: `Code ${code} added`, status: 200 }),
  removeCode: async (caseId: string, type: 'ICD-10' | 'CPT', code: string) => ({ data: { success: true }, message: `Code ${code} removed`, status: 200 }),
  submitChart: async (caseId: string) => ({ data: { success: true }, message: `Chart submitted successfully`, status: 200 }),
};
