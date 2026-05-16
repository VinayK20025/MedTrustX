/**
 * MedTrustX — Medical Student API Client
 * Read-only academic and anonymized clinical data
 */
import type { StudentDashboardData } from '../types/student.types';

const BASE_URL = '/api/v1/academic/student';

export interface StudentFilters {
  course?: string;
}

/* ── MOCK DATA ─────────────────────────────────────────── */

const mockKpis: StudentDashboardData['kpis'] = [
  { id: '1', title: 'Cases Observed', value: 12, status: 'normal', delta: 'Internal Medicine' },
  { id: '2', title: 'Modules Completed', value: 8, status: 'success', delta: 'Cardiology 101' },
  { id: '3', title: 'Avg Quiz Score', value: '88%', status: 'success', delta: 'Top 15% of class' },
];

const mockCases: StudentDashboardData['cases'] = [
  { id: 'CASE-4029', patientAge: 45, patientGender: 'M', diagnosis: 'Community Acquired Pneumonia', department: 'Pulmonology', status: 'active', anonymized: true },
  { id: 'CASE-4030', patientAge: 62, patientGender: 'F', diagnosis: 'Heart Failure (HFrEF)', department: 'Cardiology', status: 'resolved', anonymized: true },
  { id: 'CASE-4031', patientAge: 28, patientGender: 'M', diagnosis: 'Acute Appendicitis', department: 'General Surgery', status: 'active', anonymized: true },
];

const mockModules: StudentDashboardData['academicModules'] = [
  { id: 'M1', title: 'Pneumonia Treatment Pathways', type: 'pathway', contextMatch: 'Matches CASE-4029', completionPercentage: 100 },
  { id: 'M2', title: 'Echocardiogram Interpretation', type: 'protocol', contextMatch: 'Matches CASE-4030', completionPercentage: 40 },
  { id: 'M3', title: 'Recent Advances in Antibiotics', type: 'research', contextMatch: 'General Reading', completionPercentage: 0 },
];

const mockDiscussions: StudentDashboardData['discussions'] = [
  { id: 'D1', topic: 'Why Ceftriaxone over Azithromycin here?', caseId: 'CASE-4029', lastReplyBy: 'Dr. Sharma (Consultant)', unreadCount: 1 },
  { id: 'D2', topic: 'Indications for early surgery', caseId: 'CASE-4031', lastReplyBy: 'Dr. Lee (SR)', unreadCount: 0 },
];

const mockAssessments: StudentDashboardData['assessments'] = [
  { id: 'Q1', title: 'Respiratory Cases Quiz 1', score: null, status: 'pending' },
  { id: 'Q2', title: 'Cardiology Fundamentals', score: 92, status: 'completed' },
];

/* ── API Service ───────────────────────────────────────── */

export const studentApi = {
  getDashboardSummary: async (filters: StudentFilters) => ({
    data: {
      kpis: mockKpis,
      cases: mockCases,
      academicModules: mockModules,
      discussions: mockDiscussions,
      assessments: mockAssessments,
    } as StudentDashboardData,
    message: 'Success', status: 200,
  }),
};
