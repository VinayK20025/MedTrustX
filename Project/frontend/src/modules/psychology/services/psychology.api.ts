import type {
  PsychologyDashboardData, PsychologyKPI, PsychologyPatient, PsychologyAssessment,
  PsychologySession, PsychologyNote, PsychologyConfidentialNote
} from '../types/psychology.types';

export interface PsychologyFilters {
  riskLevel?: string;
}

const mockKpis: PsychologyKPI[] = [
  { id: '1', title: 'Active Clients', value: 42, format: 'number', status: 'normal', trend: 2, trendDirection: 'up' },
  { id: '2', title: 'Sessions Today', value: 7, format: 'number', status: 'normal' },
  { id: '3', title: 'High Risk Alerts', value: 1, format: 'number', status: 'critical', actionLabel: 'Review Safety Plan', actionUrl: '/dashboard/psychology/patients' },
  { id: '4', title: 'Draft Notes Pending', value: 3, format: 'number', status: 'warning', actionLabel: 'Complete Notes', actionUrl: '/dashboard/psychology/notes' },
];

const mockPatients: PsychologyPatient[] = [
  { id: 'PAT-PSY-01', name: 'Eleanor Vance', mrn: 'MRN-8842', age: 34, diagnosis: 'Generalized Anxiety Disorder', riskLevel: 'Moderate', status: 'Active', lastSessionDate: new Date(Date.now() - 86400000 * 7).toISOString(), nextSessionDate: new Date().toISOString() },
  { id: 'PAT-PSY-02', name: 'Marcus Brody', mrn: 'MRN-5521', age: 41, diagnosis: 'Major Depressive Disorder', riskLevel: 'High', status: 'Active', lastSessionDate: new Date(Date.now() - 86400000 * 2).toISOString(), nextSessionDate: new Date(Date.now() + 86400000 * 5).toISOString() },
  { id: 'PAT-PSY-03', name: 'Sarah Miller', mrn: 'MRN-2299', age: 28, diagnosis: 'PTSD', riskLevel: 'Low', status: 'Active', lastSessionDate: new Date(Date.now() - 86400000 * 14).toISOString(), nextSessionDate: new Date(Date.now() + 86400000 * 14).toISOString() },
];

const mockSessions: PsychologySession[] = [
  { id: 'SESS-PSY-01', patientId: 'PAT-PSY-01', patientName: 'Eleanor Vance', date: new Date().toISOString(), time: '10:00 AM', durationMinutes: 50, type: 'CBT', status: 'Scheduled', format: 'Telehealth' },
  { id: 'SESS-PSY-02', patientId: 'PAT-PSY-02', patientName: 'Marcus Brody', date: new Date().toISOString(), time: '01:00 PM', durationMinutes: 50, type: 'Psychotherapy', status: 'Scheduled', format: 'In-person' },
];

const mockNotes: PsychologyNote[] = [
  { id: 'NOTE-01', sessionId: 'SESS-PSY-03', patientId: 'PAT-PSY-03', date: new Date(Date.now() - 86400000).toISOString(), observations: 'Client appeared relaxed, appropriate affect.', patientStatements: '"I have been sleeping better this week."', therapistInsights: 'Reduction in hyperarousal symptoms noted.', plan: 'Continue EMDR protocols next session.', status: 'Signed' },
  { id: 'NOTE-02', sessionId: 'SESS-PSY-04', patientId: 'PAT-PSY-01', date: new Date(Date.now() - 86400000 * 7).toISOString(), observations: 'Restless, frequent shifts in posture.', patientStatements: '"I can\'t stop worrying about work."', therapistInsights: 'Persistent rumination; GAD symptoms active.', plan: 'Introduce grounding techniques.', status: 'Draft' },
];

const mockAssessments: PsychologyAssessment[] = [
  { id: 'ASSESS-01', patientId: 'PAT-PSY-02', date: '2026-04-10', type: 'PHQ-9', score: 18, interpretation: 'Moderately Severe Depression', severity: 'Moderately Severe' },
  { id: 'ASSESS-02', patientId: 'PAT-PSY-01', date: '2026-04-15', type: 'GAD-7', score: 12, interpretation: 'Moderate Anxiety', severity: 'Moderate' },
];

const mockProgressMetrics = [
  { date: 'Wk 1', phq9: 18, gad7: 14, moodScore: 3 },
  { date: 'Wk 2', phq9: 16, gad7: 12, moodScore: 4 },
  { date: 'Wk 3', phq9: 15, gad7: 10, moodScore: 5 },
  { date: 'Wk 4', phq9: 12, gad7: 9, moodScore: 6 },
  { date: 'Wk 5', phq9: 10, gad7: 7, moodScore: 7 },
];

export const psychologyApi = {
  getDashboardSummary: async (filters: PsychologyFilters) => ({
    data: {
      kpis: mockKpis,
      patients: mockPatients,
      sessionsToday: mockSessions,
      recentNotes: mockNotes,
      confidentialAlerts: 1, // Represents 1 unreviewed highly sensitive note
      assessments: mockAssessments,
      progressMetrics: mockProgressMetrics,
    } as PsychologyDashboardData,
    message: 'Success', status: 200,
  }),

  submitSessionNote: async (note: Partial<PsychologyNote>) => ({ data: { success: true }, message: 'Session note saved', status: 201 }),
  signNote: async (noteId: string) => ({ data: { success: true }, message: 'Note cryptographically signed', status: 200 }),
  unlockConfidentialNotes: async (pin: string) => {
    if (pin === '1234') return { data: { unlocked: true }, message: 'Vault unlocked', status: 200 };
    throw new Error('Invalid PIN');
  },
  submitConfidentialNote: async (note: Partial<PsychologyConfidentialNote>) => ({ data: { success: true }, message: 'Confidential note encrypted and saved', status: 201 }),
};
