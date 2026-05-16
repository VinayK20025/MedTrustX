import type { TrialCoordData } from '../types/trial-coordinator.types';

export interface TcFilters { status?: string; }

const mockData: TrialCoordData = {
  kpis: [
    { id: '1', label: 'Enrolled Subjects', value: 48, status: 'success' },
    { id: '2', label: 'Visits Today', value: 6, status: 'normal' },
    { id: '3', label: 'Open Deviations', value: 2, status: 'warning' },
    { id: '4', label: 'Protocol Adherence', value: '97%', status: 'success' },
  ],
  participants: [
    { id: 'p1', subjectId: 'SUBJ-001', name: 'Alice Chen', status: 'Active', nextVisit: new Date(Date.now() + 86400000).toISOString(), visitNumber: 4, totalVisits: 8, hasDeviation: false },
    { id: 'p2', subjectId: 'SUBJ-002', name: 'Brian Torres', status: 'Active', nextVisit: new Date(Date.now() + 3600000).toISOString(), visitNumber: 6, totalVisits: 8, hasDeviation: true },
    { id: 'p3', subjectId: 'SUBJ-003', name: 'Diana Patel', status: 'Screening', nextVisit: new Date(Date.now() + 172800000).toISOString(), visitNumber: 1, totalVisits: 8, hasDeviation: false },
    { id: 'p4', subjectId: 'SUBJ-004', name: 'Eduardo Silva', status: 'Completed', nextVisit: '---', visitNumber: 8, totalVisits: 8, hasDeviation: false },
  ],
  visitTasks: [
    { id: 'vt1', label: 'Verify Informed Consent (v3.1)', type: 'Consent', isCompleted: true },
    { id: 'vt2', label: 'Collect Blood Sample (CBC + BMP)', type: 'Lab', isCompleted: false },
    { id: 'vt3', label: 'Administer QoL Questionnaire', type: 'Assessment', isCompleted: false },
    { id: 'vt4', label: 'Complete Visit CRF Page 6-12', type: 'Document', isCompleted: false },
    { id: 'vt5', label: 'Record Adverse Event Check', type: 'Assessment', isCompleted: false },
  ],
  deviations: [
    { id: 'dev1', subject: 'SUBJ-002', issue: 'Visit window exceeded by 3 days', severity: 'Minor', status: 'Open', reportedAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'dev2', subject: 'SUBJ-007', issue: 'Prohibited concomitant medication used', severity: 'Major', status: 'Open', reportedAt: new Date(Date.now() - 86400000).toISOString() }
  ]
};

export const trialCoordApi = {
  getDashboardSummary: async (f: TcFilters) => ({ data: mockData, message: 'Success', status: 200 }),
  completeVisitTask: async (taskId: string) => ({ data: { success: true }, message: 'Visit task completed', status: 200 }),
  resolveDeviation: async (devId: string) => ({ data: { success: true }, message: 'Deviation resolved', status: 200 }),
};
