import type {
  SpeechDashboardData, SpeechKPI, SpeechPatient, SpeechAssessment,
  SpeechTherapyPlan, SpeechSession, SpeechEducationMaterial
} from '../types/speech.types';

export interface SpeechFilters {
  timeframe?: string;
  patientId?: string;
}

const mockKpis: SpeechKPI[] = [
  { id: '1', title: 'Active Patients', value: 18, format: 'number', status: 'normal', trend: 1, trendDirection: 'up' },
  { id: '2', title: 'Sessions Today', value: 6, format: 'number', status: 'warning', actionLabel: 'View Schedule', actionUrl: '/dashboard/speech-therapy/sessions' },
  { id: '3', title: 'Avg Cognitive Improv.', value: '14%', format: 'percentage', status: 'success', trend: 3.2, trendDirection: 'up' },
  { id: '4', title: 'Pending Reassessments', value: 2, format: 'number', status: 'critical', actionLabel: 'Assess Now', actionUrl: '/dashboard/speech-therapy/assessment' },
];

const mockPatients: SpeechPatient[] = [
  { id: 'PAT-ST-01', name: 'Alice Walker', mrn: 'MRN-2211', age: 71, diagnosis: 'Aphasia (Post-Stroke)', communicationLevel: 'Limited', therapyStatus: 'Active', lastSessionDate: new Date(Date.now() - 86400000 * 3).toISOString(), nextSessionDate: new Date(Date.now() + 3600000).toISOString(), assignedTherapist: 'ST-01' },
  { id: 'PAT-ST-02', name: 'David Lee', mrn: 'MRN-5542', age: 8, diagnosis: 'Stuttering / Fluency Disorder', communicationLevel: 'Fluent', therapyStatus: 'Active', lastSessionDate: new Date(Date.now() - 86400000).toISOString(), nextSessionDate: new Date(Date.now() + 86400000).toISOString(), assignedTherapist: 'ST-01' },
  { id: 'PAT-ST-03', name: 'Martha Evans', mrn: 'MRN-9988', age: 85, diagnosis: 'Dysphagia', communicationLevel: 'Functional', therapyStatus: 'Pending Assessment', lastSessionDate: new Date(Date.now() - 86400000 * 7).toISOString(), nextSessionDate: new Date(Date.now() + 172800000).toISOString(), assignedTherapist: 'ST-02' },
];

const mockActivePlan: SpeechTherapyPlan = {
  id: 'PLAN-ST-01', patientId: 'PAT-ST-01', startDate: '2026-03-10', endDate: '2026-06-10', goals: ['Improve naming of common objects to 80% accuracy', 'Produce 3-4 word phrases independently'], status: 'Active', progressPercentage: 35,
  exercises: [
    { id: 'EX-ST-1', name: 'Semantic Feature Analysis', targetArea: 'Comprehension', frequency: 'Daily', instructions: 'Use visual charts to describe properties of targeted nouns.' },
    { id: 'EX-ST-2', name: 'Melodic Intonation Therapy', targetArea: 'Articulation', frequency: '3x/Week', instructions: 'Sing 2-syllable functional phrases with tapping.' },
  ]
};

const mockSessions: SpeechSession[] = [
  { id: 'SESS-ST-01', patientId: 'PAT-ST-01', patientName: 'Alice Walker', date: new Date().toISOString(), time: '09:00 AM', durationMinutes: 45, type: 'Language Therapy', status: 'Completed', notes: 'Completed naming exercises with 60% accuracy without cues.', activities: ['Picture Naming', 'Phrase Completion'] },
  { id: 'SESS-ST-02', patientId: 'PAT-ST-02', patientName: 'David Lee', date: new Date().toISOString(), time: '11:00 AM', durationMinutes: 30, type: 'Speech Therapy', status: 'In Progress', notes: '', activities: ['Fluency Shaping', 'Reading Aloud'] },
  { id: 'SESS-ST-03', patientId: 'PAT-ST-03', patientName: 'Martha Evans', date: new Date().toISOString(), time: '02:00 PM', durationMinutes: 60, type: 'Swallowing Therapy', status: 'Scheduled', notes: '', activities: ['Mendelsohn Maneuver', 'Diet Modification'] },
];

const mockAssessments: SpeechAssessment[] = [
  { id: 'ASSESS-ST-01', patientId: 'PAT-ST-01', date: '2026-03-10', type: 'Language', articulationScore: 40, fluencyScore: 50, comprehensionScore: 35, swallowingScore: 9, notes: 'Expressive aphasia noted. Receptive language is moderately impaired.', therapistId: 'ST-01' },
  { id: 'ASSESS-ST-02', patientId: 'PAT-ST-01', date: '2026-04-15', type: 'Language', articulationScore: 55, fluencyScore: 60, comprehensionScore: 50, swallowingScore: 9, notes: 'Improvement in single-word verbal expression. Following 1-step commands reliably.', therapistId: 'ST-01' },
];

const mockProgressMetrics = [
  { date: 'Wk 1', clarity: 40, comprehension: 35, fluency: 50 },
  { date: 'Wk 2', clarity: 45, comprehension: 40, fluency: 52 },
  { date: 'Wk 3', clarity: 50, comprehension: 45, fluency: 55 },
  { date: 'Wk 4', clarity: 52, comprehension: 48, fluency: 58 },
  { date: 'Wk 5', clarity: 55, comprehension: 50, fluency: 60 },
];

const mockEducation: SpeechEducationMaterial[] = [
  { id: 'EDU-ST-01', title: 'Safe Swallowing Strategies', category: 'Swallowing', description: 'Handout on chin tucks and small sips.', format: 'PDF', url: '#' },
  { id: 'EDU-ST-02', title: 'Aphasia Communication Tips', category: 'General', description: 'Video guide for family members on how to communicate effectively.', format: 'Video', url: '#' },
];

export const speechApi = {
  getDashboardSummary: async (filters: SpeechFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      activePlan: mockActivePlan,
      sessionsToday: mockSessions,
      assessments: mockAssessments,
      progressMetrics: mockProgressMetrics,
      educationMaterials: mockEducation,
    } as SpeechDashboardData,
    message: 'Success', status: 200,
  }),

  startSession: async (sessionId: string) => ({ data: { success: true }, message: 'Session started', status: 200 }),
  completeSession: async (sessionId: string, notes: string) => ({ data: { success: true }, message: 'Session completed', status: 200 }),
  submitAssessment: async (assessment: Partial<SpeechAssessment>) => ({ data: { success: true }, message: 'Assessment saved', status: 201 }),
  updateTherapyPlan: async (planId: string, updates: Partial<SpeechTherapyPlan>) => ({ data: { success: true }, message: 'Plan updated', status: 200 }),
};
