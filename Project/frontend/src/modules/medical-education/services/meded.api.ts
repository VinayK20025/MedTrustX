import { apiGet, apiPost } from '@/services/api';
import type { MedEdDashboardData, MedEdStudent, MedEdCourse, MedEdExam } from '../types/meded.types';

const t = (daysAway: number) => new Date(Date.now() + daysAway * 86400000).toISOString();

const mockStudents: MedEdStudent[] = [
  { id: 'STU-001', name: 'Dr. Aarav Sharma', type: 'Resident', department: 'Cardiology', yearOfStudy: 2, mentor: 'Dr. Marcus Webb', gpa: 3.8, completedCredits: 45, totalRequiredCredits: 120 },
  { id: 'STU-002', name: 'Priya Iyer', type: 'Medical Student', department: 'General Medicine', yearOfStudy: 4, mentor: 'Dr. Sarah Chen', gpa: 3.9, completedCredits: 90, totalRequiredCredits: 150 },
  { id: 'STU-003', name: 'Dr. Kevin Zhang', type: 'Fellow', department: 'Neurology', yearOfStudy: 1, mentor: 'Dr. Elena Rostova', gpa: 4.0, completedCredits: 20, totalRequiredCredits: 60 },
];

const mockCourses: MedEdCourse[] = [
  { id: 'CRS-101', code: 'CARD-702', title: 'Advanced Echocardiography', instructor: 'Dr. Marcus Webb', credits: 4, status: 'Active', enrollmentCount: 12, nextSession: t(2) },
  { id: 'CRS-102', code: 'NEURO-605', title: 'Neuroanatomy of Memory', instructor: 'Dr. Elena Rostova', credits: 3, status: 'Active', enrollmentCount: 25, nextSession: t(5) },
  { id: 'CRS-103', code: 'SURG-800', title: 'Robotic Surgery Fundamentals', instructor: 'Dr. James Okafor', credits: 5, status: 'Pending', enrollmentCount: 8, nextSession: t(15) },
];

const mockExams: MedEdExam[] = [
  { id: 'EXM-501', title: 'Board Certification Mock Exam', date: t(10), studentCount: 45, status: 'Scheduled' },
  { id: 'EXM-502', title: 'Anatomy Practical Finals', date: t(-2), studentCount: 120, averageScore: 84.5, status: 'Graded' },
];

const mockData: MedEdDashboardData = {
  metrics: {
    totalStudents: 450,
    activeCourses: 28,
    upcomingExams: 5,
    passRatePercent: 94.2,
    cmeHoursDelivered: 1240
  },
  students: mockStudents,
  courses: mockCourses,
  exams: mockExams
};

export const medEdApi = {
  getDashboardData: async (): Promise<{ data: MedEdDashboardData; message: string; status: number }> => {
    try {
      const res = await apiGet<{ data: MedEdDashboardData }>('/api/v1/medical-education/dashboard');
      return { data: res.data, message: 'OK', status: 200 };
    } catch {
      return { data: mockData, message: 'Mock data used', status: 200 };
    }
  },

  enrollStudent: async (courseId: string, studentId: string) => {
    try {
      return await apiPost(`/api/v1/medical-education/courses/${courseId}/enroll`, { studentId });
    } catch {
      return { data: { success: true }, message: 'Student enrolled (Mock)', status: 200 };
    }
  }
};
