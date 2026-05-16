import type { ResearcherData } from '../types/researcher.types';

export interface ResFilters { status?: string; phase?: string; }

const mockData: ResearcherData = {
  kpis: [
    { id: '1', label: 'Active Trials', value: 4, status: 'normal' },
    { id: '2', label: 'Total Enrolled', value: 342, status: 'success' },
    { id: '3', label: 'Adverse Events', value: 2, status: 'warning' },
    { id: '4', label: 'IRB Approvals Pending', value: 1, status: 'warning' },
  ],
  studies: [
    { id: 'TRL-901', title: 'CardioMeds Phase 3 Efficacy', phase: 'Phase 3', status: 'Active', targetEnrollment: 500, currentEnrollment: 215, adverseEvents: 1, progress: 43 },
    { id: 'TRL-902', title: 'NeuroRegen Safety Profile', phase: 'Phase 1', status: 'Active', targetEnrollment: 50, currentEnrollment: 48, adverseEvents: 0, progress: 96 },
    { id: 'TRL-903', title: 'Immunotherapy Dosing', phase: 'Phase 2', status: 'Paused', targetEnrollment: 150, currentEnrollment: 75, adverseEvents: 1, progress: 50 },
    { id: 'TRL-904', title: 'Post-Op Analgesia Compare', phase: 'Phase 4', status: 'Design', targetEnrollment: 1000, currentEnrollment: 0, adverseEvents: 0, progress: 0 },
  ],
  insights: [
    { id: 'i1', metric: 'Efficacy (Primary Endpoint)', value: '+24%', trend: 'up', significance: 'high' },
    { id: 'i2', metric: 'Dropout Rate', value: '4.2%', trend: 'down', significance: 'low' },
    { id: 'i3', metric: 'Protocol Deviations', value: '1.1%', trend: 'neutral', significance: 'medium' }
  ],
  approvals: [
    { id: 'app1', board: 'Central Ethics Committee', status: 'Approved', validUntil: '2027-11-15' },
    { id: 'app2', board: 'Regional Health Authority', status: 'Pending Review', validUntil: '---' },
  ]
};

export const researcherApi = {
  getDashboardSummary: async (f: ResFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  logAdverseEvent: async (studyId: string) => ({ data: { success: true }, message: `Adverse event logged for ${studyId}`, status: 200 }),
  generateStudyReport: async (studyId: string) => ({ data: { url: '/reports/study.pdf' }, message: 'Report generation started', status: 200 }),
};
