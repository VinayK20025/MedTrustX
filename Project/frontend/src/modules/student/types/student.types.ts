/**
 * MedTrustX — Medical Student Module Types
 * Academic, anonymized, read-only data models
 */

export interface StudentKPI {
  id: string;
  title: string;
  value: string | number;
  status: 'normal' | 'warning' | 'critical' | 'success';
  delta?: string;
}

export interface StudentCase {
  id: string; // e.g. CASE-4029
  patientAge: number;
  patientGender: 'M' | 'F' | 'O';
  diagnosis: string;
  department: string;
  status: 'active' | 'resolved';
  anonymized: true;
}

export interface StudentModule {
  id: string;
  title: string;
  type: 'protocol' | 'pathway' | 'research';
  contextMatch: string; 
  completionPercentage: number;
}

export interface StudentDiscussion {
  id: string;
  topic: string;
  caseId?: string;
  lastReplyBy: string;
  unreadCount: number;
}

export interface StudentAssessment {
  id: string;
  title: string;
  score: number | null;
  status: 'pending' | 'completed';
}

export interface StudentDashboardData {
  kpis: StudentKPI[];
  cases: StudentCase[];
  academicModules: StudentModule[];
  discussions: StudentDiscussion[];
  assessments: StudentAssessment[];
}
