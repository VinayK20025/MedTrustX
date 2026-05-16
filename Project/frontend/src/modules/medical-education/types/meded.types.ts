/**
 * MedTrustX — Medical Education Service Types
 */

export type StudentType = 'Medical Student' | 'Resident' | 'Fellow' | 'Attending';
export type CourseStatus = 'Active' | 'Elective' | 'Completed' | 'Pending';
export type ExamStatus = 'Scheduled' | 'In Progress' | 'Graded' | 'Retake Required';

export interface MedEdStudent {
  id: string;
  name: string;
  type: StudentType;
  department: string;
  yearOfStudy: number;
  mentor: string;
  gpa?: number;
  completedCredits: number;
  totalRequiredCredits: number;
}

export interface MedEdCourse {
  id: string;
  code: string;
  title: string;
  instructor: string;
  credits: number;
  status: CourseStatus;
  enrollmentCount: number;
  nextSession: string;
}

export interface MedEdExam {
  id: string;
  title: string;
  date: string;
  studentCount: number;
  averageScore?: number;
  status: ExamStatus;
}

export interface MedEdCertification {
  id: string;
  name: string;
  issuingBody: string;
  validityYears: number;
  studentId: string;
  issueDate: string;
  expiryDate: string;
}

export interface MedEdMetrics {
  totalStudents: number;
  activeCourses: number;
  upcomingExams: number;
  passRatePercent: number;
  cmeHoursDelivered: number;
}

export interface MedEdDashboardData {
  metrics: MedEdMetrics;
  students: MedEdStudent[];
  courses: MedEdCourse[];
  exams: MedEdExam[];
}
