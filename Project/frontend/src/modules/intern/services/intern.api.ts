/**
 * MedTrustX — Medical Intern API Client
 * Read-only clinical data and learning content
 */
import type { InternDashboardData } from '../types/intern.types';

const BASE_URL = '/api/v1/clinical/intern';

export interface InternFilters {
  view?: 'all' | 'learning';
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: InternDashboardData['kpis'] = [
  { id: '1', title: 'Patients Observed', value: 6, status: 'normal', delta: 'Under Dr. Sharma' },
  { id: '2', title: 'Tasks Assisted', value: 4, status: 'success', delta: 'Drafts pending review' },
  { id: '3', title: 'Modules Completed', value: 2, status: 'success', delta: 'This week' },
];

const mockPatients: InternDashboardData['assignedPatients'] = [
  { id: 'P1', patientName: 'A. Kumar', age: 45, gender: 'M', diagnosis: 'Pneumonia', status: 'stable', permissions: ['read_only'] },
  { id: 'P2', patientName: 'S. Devi', age: 62, gender: 'F', diagnosis: 'COPD Exacerbation', status: 'critical', permissions: ['read_only'] },
];

const mockTasks: InternDashboardData['assistedTasks'] = [
  { id: 'T1', title: 'Draft Progress Note', patientName: 'A. Kumar', supervisor: 'Dr. Patel (JR)', status: 'draft_submitted', requiresApproval: true },
  { id: 'T2', title: 'Observe ABG Draw', patientName: 'S. Devi', supervisor: 'Dr. Sharma (SR)', status: 'pending', requiresApproval: false },
  { id: 'T3', title: 'Record Routine Vitals', patientName: 'R. Singh', supervisor: 'Dr. Patel (JR)', status: 'approved', requiresApproval: true },
];

const mockLearningModules: InternDashboardData['learningModules'] = [
  { id: 'L1', title: 'Community Acquired Pneumonia Guidelines', category: 'protocol', contextMatch: 'Relevant to A. Kumar', completionPercentage: 100 },
  { id: 'L2', title: 'Understanding ABG Results', category: 'case_study', contextMatch: 'Relevant to S. Devi', completionPercentage: 40 },
  { id: 'L3', title: 'Basic Clinical Documentation', category: 'guideline', contextMatch: 'General Requirement', completionPercentage: 0 },
];

const mockFeedback: InternDashboardData['feedback'] = [
  { id: 'F1', supervisor: 'Dr. Sharma (SR)', date: 'Yesterday', rating: 4, comment: 'Good observation skills during the central line placement. Draft notes need more concise history taking.' },
];

/* ── API Service ───────────────────────────────────────── */

export const internApi = {
  getDashboardSummary: async (filters: InternFilters) => ({
    data: {
      kpis: mockKpis,
      assignedPatients: mockPatients,
      assistedTasks: mockTasks,
      learningModules: mockLearningModules,
      feedback: mockFeedback,
    } as InternDashboardData,
    message: 'Success', status: 200,
  }),
};
