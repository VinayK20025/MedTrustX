import type {
  RehabDashboardData, RehabKPI, RehabPatient, RehabAssessment,
  RehabTherapyPlan, RehabSession, RehabEducationMaterial
} from '../types/rehab.types';

export interface RehabFilters {
  timeframe?: string;
  patientId?: string;
}

const mockKpis: RehabKPI[] = [
  { id: '1', title: 'Active Patients', value: 24, format: 'number', status: 'normal', trend: 2, trendDirection: 'up' },
  { id: '2', title: 'Sessions Today', value: 8, format: 'number', status: 'warning', actionLabel: 'View Schedule', actionUrl: '/dashboard/rehab/sessions' },
  { id: '3', title: 'Avg Improvement Rate', value: '18%', format: 'percentage', status: 'success', trend: 4.5, trendDirection: 'up' },
  { id: '4', title: 'Pending Reassessments', value: 3, format: 'number', status: 'critical', actionLabel: 'Assess Now', actionUrl: '/dashboard/rehab/assessment' },
];

const mockPatients: RehabPatient[] = [
  { id: 'PAT-101', name: 'Robert Chen', mrn: 'MRN-8812', age: 62, diagnosis: 'Post-Stroke Hemiparesis', condition: 'Improving mobility on right side', mobilityScore: 45, painLevel: 3, therapyStatus: 'Active', lastSessionDate: new Date(Date.now() - 86400000 * 2).toISOString(), nextSessionDate: new Date(Date.now() + 3600000).toISOString(), assignedTherapist: 'PT-01' },
  { id: 'PAT-102', name: 'Maria Garcia', mrn: 'MRN-3394', age: 45, diagnosis: 'ACL Reconstruction', condition: 'Phase 2 rehab, increasing ROM', mobilityScore: 68, painLevel: 5, therapyStatus: 'Active', lastSessionDate: new Date(Date.now() - 86400000).toISOString(), nextSessionDate: new Date(Date.now() + 86400000).toISOString(), assignedTherapist: 'PT-01' },
  { id: 'PAT-103', name: 'James Smith', mrn: 'MRN-7741', age: 78, diagnosis: 'Hip Arthroplasty', condition: 'Discharge planning', mobilityScore: 82, painLevel: 2, therapyStatus: 'Pending Assessment', lastSessionDate: new Date(Date.now() - 86400000 * 5).toISOString(), nextSessionDate: new Date(Date.now() + 172800000).toISOString(), assignedTherapist: 'OT-02' },
];

const mockActivePlan: RehabTherapyPlan = {
  id: 'PLAN-101', patientId: 'PAT-101', startDate: '2026-03-01', endDate: '2026-06-01', goals: ['Achieve independent walking with cane', 'Improve right arm reach by 30%'], status: 'Active', progressPercentage: 45,
  exercises: [
    { id: 'EX-1', name: 'Seated Knee Extensions', targetArea: 'Quadriceps', sets: 3, reps: 10, frequency: 'Daily', instructions: 'Hold at the top for 3 seconds' },
    { id: 'EX-2', name: 'Shoulder Flexion Assist', targetArea: 'Anterior Deltoid', sets: 2, reps: 15, frequency: 'Daily', instructions: 'Use pulley system to assist right arm' },
  ]
};

const mockSessions: RehabSession[] = [
  { id: 'SESS-201', patientId: 'PAT-101', patientName: 'Robert Chen', date: new Date().toISOString(), time: '09:00 AM', durationMinutes: 45, type: 'Physical Therapy', status: 'Completed', notes: 'Good effort, improved knee extension by 5 degrees.', painLevelBefore: 4, painLevelAfter: 3 },
  { id: 'SESS-202', patientId: 'PAT-102', patientName: 'Maria Garcia', date: new Date().toISOString(), time: '11:00 AM', durationMinutes: 30, type: 'Physical Therapy', status: 'In Progress', notes: '', painLevelBefore: 5, painLevelAfter: 0 },
  { id: 'SESS-203', patientId: 'PAT-103', patientName: 'James Smith', date: new Date().toISOString(), time: '02:00 PM', durationMinutes: 60, type: 'Occupational Therapy', status: 'Scheduled', notes: '', painLevelBefore: 0, painLevelAfter: 0 },
];

const mockAssessments: RehabAssessment[] = [
  { id: 'ASSESS-01', patientId: 'PAT-101', date: '2026-03-01', type: 'Initial', romScore: 40, strengthScore: 2, painScale: 6, independenceScore: 35, notes: 'Significant weakness on right side. Needs assistance for transfers.', therapistId: 'PT-01' },
  { id: 'ASSESS-02', patientId: 'PAT-101', date: '2026-04-15', type: 'Reassessment', romScore: 65, strengthScore: 3, painScale: 4, independenceScore: 55, notes: 'Marked improvement in core stability and right arm ROM.', therapistId: 'PT-01' },
];

const mockProgressMetrics = [
  { date: 'Wk 1', mobility: 35, pain: 7, independence: 30 },
  { date: 'Wk 2', mobility: 40, pain: 6, independence: 35 },
  { date: 'Wk 3', mobility: 48, pain: 5, independence: 45 },
  { date: 'Wk 4', mobility: 55, pain: 4, independence: 50 },
  { date: 'Wk 5', mobility: 65, pain: 3, independence: 60 },
];

const mockEducation: RehabEducationMaterial[] = [
  { id: 'EDU-01', title: 'Stroke Recovery: Bed to Chair Transfers', category: 'Mobility Aids', description: 'Step-by-step video guide for safe transfers.', format: 'Video', url: '#' },
  { id: 'EDU-02', title: 'Post-Op Knee Replacement Exercises', category: 'Exercise', description: 'Daily exercise routine for the first 4 weeks.', format: 'PDF', url: '#' },
];

export const rehabApi = {
  getDashboardSummary: async (filters: RehabFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      activePlan: mockActivePlan,
      sessionsToday: mockSessions,
      assessments: mockAssessments,
      progressMetrics: mockProgressMetrics,
      educationMaterials: mockEducation,
    } as RehabDashboardData,
    message: 'Success', status: 200,
  }),

  startSession: async (sessionId: string) => ({ data: { success: true }, message: 'Session started', status: 200 }),
  completeSession: async (sessionId: string, notes: string) => ({ data: { success: true }, message: 'Session completed', status: 200 }),
  submitAssessment: async (assessment: Partial<RehabAssessment>) => ({ data: { success: true }, message: 'Assessment saved', status: 201 }),
  updateTherapyPlan: async (planId: string, updates: Partial<RehabTherapyPlan>) => ({ data: { success: true }, message: 'Plan updated', status: 200 }),
};
