import type { ResearchNurseData } from '../types/research-nurse.types';

export interface RnFilters { status?: string; }

const mockData: ResearchNurseData = {
  kpis: [
    { id: '1', label: 'Visits Today', value: 6, status: 'normal' },
    { id: '2', label: 'Drugs Administered', value: 4, status: 'success' },
    { id: '3', label: 'Adverse Events', value: 1, status: 'warning' },
    { id: '4', label: 'Protocol Compliance', value: '98%', status: 'success' },
  ],
  patients: [
    { id: 'rp1', subjectId: 'SUBJ-001', name: 'Alice Chen', status: 'Active', visitToday: true, nextDrugDue: new Date(Date.now() + 600000).toISOString(), hasAdverseEvent: false },
    { id: 'rp2', subjectId: 'SUBJ-002', name: 'Brian Torres', status: 'Active', visitToday: true, hasAdverseEvent: true },
    { id: 'rp3', subjectId: 'SUBJ-005', name: 'Fatima Al-Rashid', status: 'Follow-Up', visitToday: false, hasAdverseEvent: false },
    { id: 'rp4', subjectId: 'SUBJ-008', name: 'James Okafor', status: 'Screening', visitToday: true, hasAdverseEvent: false },
  ],
  protocolSteps: [
    { id: 'ps1', label: 'Verify Informed Consent (Active Version)', type: 'Consent', isCompleted: true },
    { id: 'ps2', label: 'Record Pre-Dose Vitals (BP, HR, SpO2, Temp)', type: 'Vitals', isCompleted: true },
    { id: 'ps3', label: 'Administer Investigational Drug (IV Infusion)', type: 'Drug Admin', isCompleted: false, timeSensitive: true, dueAt: new Date(Date.now() + 600000).toISOString() },
    { id: 'ps4', label: 'Collect PK Blood Sample (T=0)', type: 'Sample', isCompleted: false },
    { id: 'ps5', label: 'Post-Dose Observation (30 min monitoring)', type: 'Observation', isCompleted: false },
    { id: 'ps6', label: 'Record Post-Dose Vitals', type: 'Vitals', isCompleted: false },
  ],
  adverseEvents: [
    { id: 'ae1', subject: 'SUBJ-002', description: 'Mild headache and nausea 2 hours post-dose', severity: 'Mild', status: 'Reported', reportedAt: new Date(Date.now() - 7200000).toISOString() }
  ]
};

export const researchNurseApi = {
  getDashboardSummary: async (f: RnFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  completeProtocolStep: async (stepId: string) => ({ data: { success: true }, message: 'Protocol step completed', status: 200 }),
  reportAdverseEvent: async (payload: any) => ({ data: { success: true }, message: 'Adverse event reported to PI', status: 200 }),
};
